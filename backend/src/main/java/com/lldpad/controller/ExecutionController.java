package com.lldpad.controller;

import com.lldpad.auth.AuthCookies;
import com.lldpad.dto.Dtos.RunRequest;
import com.lldpad.dto.Dtos.TestCaseResult;
import com.lldpad.dto.Dtos.VerifyRequest;
import com.lldpad.dto.Dtos.VerifyResponse;
import com.lldpad.entity.Problem;
import com.lldpad.entity.SolvedProblem;
import com.lldpad.repository.SolvedProblemRepository;
import com.lldpad.service.CodeExecutionService;
import com.lldpad.service.CodeExecutionService.Outcome;
import com.lldpad.service.CodeExecutionService.PistonException;
import com.lldpad.service.ProblemService;
import com.lldpad.web.ApiException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CookieValue;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.stream.IntStream;

@RestController
@RequestMapping("/api")
public class ExecutionController {

    private static final Logger log = LoggerFactory.getLogger(ExecutionController.class);

    private final CodeExecutionService executionService;
    private final ProblemService problemService;
    private final SolvedProblemRepository solvedProblemRepository;
    private final AuthCookies authCookies;

    public ExecutionController(CodeExecutionService executionService, ProblemService problemService,
                               SolvedProblemRepository solvedProblemRepository, AuthCookies authCookies) {
        this.executionService = executionService;
        this.problemService = problemService;
        this.solvedProblemRepository = solvedProblemRepository;
        this.authCookies = authCookies;
    }

    @PostMapping("/run")
    public ResponseEntity<Map<String, String>> run(@RequestBody RunRequest req,
                                                   @CookieValue(name = AuthCookies.NAME, required = false) String token) {
        authCookies.requireUserId(token, "Please login to run code");

        Outcome outcome;
        try {
            outcome = executionService.execute(req.code(), req.language(), req.input());
        } catch (PistonException e) {
            return ResponseEntity.status(e.getStatus()).body(Map.of("error", "Piston API error: " + e.getMessage()));
        } catch (ApiException e) {
            throw e;
        } catch (Exception e) {
            throw new ApiException(HttpStatus.INTERNAL_SERVER_ERROR, "Failed to execute code: " + e.getMessage());
        }

        String output = outcome.compileError() != null
                ? "Compilation Error:\n" + outcome.compileError()
                : outcome.output();
        return ResponseEntity.ok(Map.of("output", output.isEmpty() ? "No output produced" : output));
    }

    @PostMapping("/verify")
    public VerifyResponse verify(@RequestBody VerifyRequest req,
                                 @CookieValue(name = AuthCookies.NAME, required = false) String token) {
        String userId = authCookies.requireUserId(token, "Please login to verify solutions");
        if (isBlank(req.code()) || isBlank(req.language()) || isBlank(req.problemId())) {
            throw ApiException.badRequest("Missing required fields: code, language, problemId");
        }
        executionService.requireSupported(req.language());

        Problem problem = problemService.getOrCreateBySlug(req.problemId());
        List<String> inputs = problem.getInputCases();
        List<String> outputs = problem.getOutputCases();
        if (inputs == null || outputs == null) {
            throw ApiException.notFound("Problem not found or test cases not available");
        }
        if (inputs.size() != outputs.size()) {
            throw new ApiException(HttpStatus.INTERNAL_SERVER_ERROR, "Invalid test cases configuration");
        }

        // Test cases run concurrently, one virtual thread each.
        List<TestCaseResult> results;
        try (ExecutorService executor = Executors.newVirtualThreadPerTaskExecutor()) {
            List<CompletableFuture<TestCaseResult>> futures = IntStream.range(0, inputs.size())
                    .mapToObj(i -> CompletableFuture.supplyAsync(
                            () -> runTestCase(req, i, inputs.get(i), outputs.get(i)), executor))
                    .toList();
            results = futures.stream().map(CompletableFuture::join).toList();
        }

        long passedCount = results.stream().filter(TestCaseResult::passed).count();
        boolean allPassed = passedCount == results.size();

        if (allPassed) {
            try {
                if (!solvedProblemRepository.existsByUserIdAndProblemId(userId, problem.getId())) {
                    SolvedProblem solved = new SolvedProblem();
                    solved.setUserId(userId);
                    solved.setProblemId(problem.getId());
                    solvedProblemRepository.save(solved);
                }
            } catch (Exception e) {
                log.error("Error marking problem as solved", e);
            }
        }

        return new VerifyResponse(allPassed, passedCount, results.size(), results);
    }

    private TestCaseResult runTestCase(VerifyRequest req, int index, String input, String expectedOutput) {
        int testCase = index + 1;
        try {
            Outcome outcome = executionService.execute(req.code(), req.language(), input);
            if (outcome.compileError() != null) {
                return TestCaseResult.failed(testCase, "Compilation Error: " + outcome.compileError());
            }
            // Normalize output for comparison (trim whitespace)
            String expected = expectedOutput.trim();
            String actual = outcome.output().trim();
            return new TestCaseResult(testCase, actual.equals(expected), input, expected, actual, null);
        } catch (PistonException e) {
            return TestCaseResult.failed(testCase, "Execution failed: " + e.getStatusText());
        } catch (Exception e) {
            return TestCaseResult.failed(testCase, e.getMessage() != null ? e.getMessage() : "Unknown error");
        }
    }

    private static boolean isBlank(String s) {
        return s == null || s.isBlank();
    }
}
