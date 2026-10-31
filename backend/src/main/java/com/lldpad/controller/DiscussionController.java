package com.lldpad.controller;

import com.lldpad.auth.AuthCookies;
import com.lldpad.dto.Dtos.CommentDto;
import com.lldpad.dto.Dtos.CreateCommentRequest;
import com.lldpad.dto.Dtos.CreateDiscussionRequest;
import com.lldpad.dto.Dtos.DiscussionDto;
import com.lldpad.dto.Dtos.VoteRequest;
import com.lldpad.dto.Dtos.VoteResult;
import com.lldpad.service.DiscussionService;
import com.lldpad.service.ProblemService;
import com.lldpad.service.VoteService;
import com.lldpad.web.ApiException;
import org.springframework.web.bind.annotation.CookieValue;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api")
public class DiscussionController {

    private final DiscussionService discussionService;
    private final ProblemService problemService;
    private final VoteService voteService;
    private final AuthCookies authCookies;

    public DiscussionController(DiscussionService discussionService, ProblemService problemService,
                                VoteService voteService, AuthCookies authCookies) {
        this.discussionService = discussionService;
        this.problemService = problemService;
        this.voteService = voteService;
        this.authCookies = authCookies;
    }

    @GetMapping("/discussions")
    public List<DiscussionDto> discussions(@RequestParam(required = false) String problemId) {
        if (isBlank(problemId)) {
            throw ApiException.badRequest("Missing problemId parameter");
        }
        return discussionService.listForProblem(problemService.getOrCreateBySlug(problemId).getId());
    }

    @PostMapping("/discussions")
    public DiscussionDto createDiscussion(@RequestBody CreateDiscussionRequest req,
                                          @CookieValue(name = AuthCookies.NAME, required = false) String token) {
        if (isBlank(req.problemId()) || isBlank(req.title()) || isBlank(req.content())) {
            throw ApiException.badRequest("Missing required fields: problemId, title, content");
        }
        String actualProblemId = problemService.getOrCreateBySlug(req.problemId()).getId();
        String userId = authCookies.requireUserId(token, "Please login to create discussions");
        return discussionService.create(actualProblemId, userId, req.title(), req.content());
    }

    @GetMapping("/comments")
    public List<CommentDto> comments(@RequestParam(required = false) String discussionId) {
        if (isBlank(discussionId)) {
            throw ApiException.badRequest("Missing discussionId parameter");
        }
        return discussionService.commentTree(discussionId);
    }

    @PostMapping("/comments")
    public CommentDto createComment(@RequestBody CreateCommentRequest req,
                                    @CookieValue(name = AuthCookies.NAME, required = false) String token) {
        if (isBlank(req.discussionId()) || isBlank(req.content())) {
            throw ApiException.badRequest("Missing required fields: discussionId, content");
        }
        String userId = authCookies.requireUserId(token, "Please login to create comments");
        return discussionService.createComment(req.discussionId(), req.parentId(), userId, req.content());
    }

    @PostMapping("/votes")
    public VoteResult vote(@RequestBody VoteRequest req,
                           @CookieValue(name = AuthCookies.NAME, required = false) String token) {
        if (isBlank(req.targetType()) || isBlank(req.targetId()) || req.value() == null) {
            throw ApiException.badRequest("Missing required fields: targetType, targetId, value");
        }
        if (!VoteService.DISCUSSION.equals(req.targetType()) && !VoteService.COMMENT.equals(req.targetType())) {
            throw ApiException.badRequest("targetType must be \"discussion\" or \"comment\"");
        }
        if (req.value() != 1 && req.value() != -1) {
            throw ApiException.badRequest("value must be 1 or -1");
        }
        String userId = authCookies.requireUserId(token, "Please login to vote");
        return voteService.vote(userId, req.targetType(), req.targetId(), req.value());
    }

    private static boolean isBlank(String s) {
        return s == null || s.isBlank();
    }
}
