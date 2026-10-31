package com.lldpad.controller;

import com.lldpad.auth.AuthCookies;
import com.lldpad.entity.SolvedProblem;
import com.lldpad.repository.SolvedProblemRepository;
import com.lldpad.service.ProblemCatalog;
import com.lldpad.service.ProblemCatalog.CatalogProblem;
import com.lldpad.service.ProblemService;
import com.lldpad.web.ApiException;
import org.springframework.web.bind.annotation.CookieValue;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/problems")
public class ProblemController {

    private final ProblemCatalog catalog;
    private final ProblemService problemService;
    private final SolvedProblemRepository solvedProblemRepository;
    private final AuthCookies authCookies;

    public ProblemController(ProblemCatalog catalog, ProblemService problemService,
                             SolvedProblemRepository solvedProblemRepository, AuthCookies authCookies) {
        this.catalog = catalog;
        this.problemService = problemService;
        this.solvedProblemRepository = solvedProblemRepository;
        this.authCookies = authCookies;
    }

    @GetMapping
    public List<CatalogProblem> list() {
        return catalog.all();
    }

    @GetMapping("/{slug}")
    public CatalogProblem get(@PathVariable String slug) {
        return catalog.find(slug).orElseThrow(() -> ApiException.notFound("Problem not found"));
    }

    @GetMapping("/{slug}/solved")
    public Map<String, Object> isSolved(@PathVariable String slug,
                                        @CookieValue(name = AuthCookies.NAME, required = false) String token) {
        Optional<String> userId = authCookies.userId(token);
        if (userId.isEmpty()) {
            return Map.of("solved", false);
        }
        String problemId = problemService.getOrCreateBySlug(slug).getId();
        return Map.of("solved", solvedProblemRepository.existsByUserIdAndProblemId(userId.get(), problemId));
    }

    @PostMapping("/{slug}/solved")
    public Map<String, Object> markSolved(@PathVariable String slug,
                                          @CookieValue(name = AuthCookies.NAME, required = false) String token) {
        String userId = authCookies.requireUserId(token, "Please login to mark problems as solved");
        String problemId = problemService.getOrCreateBySlug(slug).getId();
        if (!solvedProblemRepository.existsByUserIdAndProblemId(userId, problemId)) {
            SolvedProblem solved = new SolvedProblem();
            solved.setUserId(userId);
            solved.setProblemId(problemId);
            solvedProblemRepository.save(solved);
        }
        return Map.of("success", true, "solved", true);
    }
}
