package com.lldpad.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.lldpad.entity.Comment;
import com.lldpad.entity.Discussion;
import com.lldpad.entity.User;
import com.lldpad.entity.Vote;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

/** Request and response bodies for the REST API. Field names match what the React client expects. */
public final class Dtos {

    private Dtos() {
    }

    // ---- requests ----

    public record LoginRequest(String email, String password) {}

    public record SignupRequest(String email, String username, String password, String step, String otp) {}

    public record SaveCodeRequest(String problemId, String language, String code) {}

    public record RunRequest(String code, String language, String input) {}

    public record VerifyRequest(String code, String language, String problemId) {}

    public record CreateDiscussionRequest(String problemId, String title, String content) {}

    public record CreateCommentRequest(String discussionId, String parentId, String content) {}

    public record VoteRequest(String targetType, String targetId, Integer value) {}

    // ---- responses ----

    public record UserDto(String id, String email, String username) {
        public static UserDto from(User u) {
            return new UserDto(u.getId(), u.getEmail(), u.getUsername());
        }
    }

    public record UserSummary(String id, String username) {
        public static UserSummary from(User u) {
            return new UserSummary(u.getId(), u.getUsername());
        }

        /** Stand-in for an author whose account no longer exists. */
        public static UserSummary deleted(String userId) {
            return new UserSummary(userId, "[deleted]");
        }
    }

    public record VoteTally(long upvotes, long downvotes) {
        public static final VoteTally EMPTY = new VoteTally(0, 0);

        public static VoteTally of(List<Vote> votes) {
            long up = votes.stream().filter(v -> v.getValue() == 1).count();
            long down = votes.stream().filter(v -> v.getValue() == -1).count();
            return new VoteTally(up, down);
        }

        public long voteCount() {
            return upvotes - downvotes;
        }
    }

    public record DiscussionDto(
            String id, String problemId, String userId, String title, String content, Instant createdAt,
            UserSummary user, long voteCount, long upvotes, long downvotes, long commentCount) {

        public static DiscussionDto from(Discussion d, UserSummary author, VoteTally tally, long commentCount) {
            return new DiscussionDto(d.getId(), d.getProblemId(), d.getUserId(), d.getTitle(), d.getContent(),
                    d.getCreatedAt(), author, tally.voteCount(), tally.upvotes(),
                    tally.downvotes(), commentCount);
        }
    }

    public record CommentDto(
            String id, String discussionId, String userId, String parentId, String content, Instant createdAt,
            UserSummary user, long voteCount, long upvotes, long downvotes, List<CommentDto> replies) {

        public static CommentDto from(Comment c, UserSummary author, VoteTally tally) {
            return new CommentDto(c.getId(), c.getDiscussionId(), c.getUserId(), c.getParentId(), c.getContent(),
                    c.getCreatedAt(), author, tally.voteCount(), tally.upvotes(),
                    tally.downvotes(), new ArrayList<>());
        }
    }

    public record VoteResult(String action, Vote vote, long voteCount, long upvotes, long downvotes) {}

    @JsonInclude(JsonInclude.Include.NON_NULL)
    public record TestCaseResult(Integer testCase, boolean passed, String input, String expected, String actual,
                                 String error) {
        public static TestCaseResult failed(int testCase, String error) {
            return new TestCaseResult(testCase, false, null, null, null, error);
        }
    }

    public record VerifyResponse(boolean allPassed, long passedCount, int totalCount, List<TestCaseResult> results) {}
}
