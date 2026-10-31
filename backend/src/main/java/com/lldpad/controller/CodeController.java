package com.lldpad.controller;

import com.lldpad.auth.AuthCookies;
import com.lldpad.dto.Dtos.SaveCodeRequest;
import com.lldpad.entity.UserCode;
import com.lldpad.repository.UserCodeRepository;
import com.lldpad.service.ProblemService;
import com.lldpad.web.ApiException;
import org.springframework.dao.DuplicateKeyException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CookieValue;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/code")
public class CodeController {

    private final ProblemService problemService;
    private final UserCodeRepository userCodeRepository;
    private final AuthCookies authCookies;

    public CodeController(ProblemService problemService, UserCodeRepository userCodeRepository,
                          AuthCookies authCookies) {
        this.problemService = problemService;
        this.userCodeRepository = userCodeRepository;
        this.authCookies = authCookies;
    }

    @GetMapping("/load")
    public Map<String, Object> load(@RequestParam(required = false) String problemId,
                                    @CookieValue(name = AuthCookies.NAME, required = false) String token) {
        if (problemId == null || problemId.isBlank()) {
            throw ApiException.badRequest("Missing problemId parameter");
        }
        String actualProblemId = problemService.getOrCreateBySlug(problemId).getId();

        Map<String, Object> body = new HashMap<>();
        body.put("code", null);
        body.put("language", null);
        authCookies.userId(token)
                .flatMap(userId -> userCodeRepository.findByUserIdAndProblemId(userId, actualProblemId))
                .ifPresent(userCode -> {
                    body.put("code", userCode.getCode());
                    body.put("language", userCode.getLanguage());
                    body.put("updatedAt", userCode.getUpdatedAt());
                });
        return body;
    }

    @PostMapping("/save")
    public ResponseEntity<Map<String, Object>> save(@RequestBody SaveCodeRequest req,
                                                    @CookieValue(name = AuthCookies.NAME, required = false) String token) {
        if (req.problemId() == null || req.language() == null || req.code() == null) {
            throw ApiException.badRequest("Missing required fields: problemId, language, code");
        }
        String actualProblemId = problemService.getOrCreateBySlug(req.problemId()).getId();

        Optional<String> userId = authCookies.userId(token);
        if (userId.isEmpty()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("success", false, "message", "Not logged in"));
        }

        UserCode saved;
        try {
            saved = upsert(userId.get(), actualProblemId, req);
        } catch (DuplicateKeyException e) {
            // Two first saves raced (the editor autosaves); the other one created the record, so update it.
            saved = upsert(userId.get(), actualProblemId, req);
        }
        return ResponseEntity.ok(Map.of("success", true, "userCode", saved));
    }

    private UserCode upsert(String userId, String problemId, SaveCodeRequest req) {
        UserCode userCode = userCodeRepository.findByUserIdAndProblemId(userId, problemId)
                .orElseGet(() -> {
                    UserCode created = new UserCode();
                    created.setUserId(userId);
                    created.setProblemId(problemId);
                    return created;
                });
        userCode.setLanguage(req.language());
        userCode.setCode(req.code());
        return userCodeRepository.save(userCode);
    }
}
