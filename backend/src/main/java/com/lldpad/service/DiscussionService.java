package com.lldpad.service;

import com.lldpad.dto.Dtos.CommentDto;
import com.lldpad.dto.Dtos.DiscussionDto;
import com.lldpad.dto.Dtos.UserSummary;
import com.lldpad.dto.Dtos.VoteTally;
import com.lldpad.entity.Comment;
import com.lldpad.entity.Discussion;
import com.lldpad.entity.User;
import com.lldpad.repository.CommentRepository;
import com.lldpad.repository.CommentRepository.DiscussionCommentCount;
import com.lldpad.repository.DiscussionRepository;
import com.lldpad.repository.UserRepository;
import com.lldpad.web.ApiException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.Collection;
import java.util.Comparator;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class DiscussionService {

    private final DiscussionRepository discussionRepository;
    private final CommentRepository commentRepository;
    private final UserRepository userRepository;
    private final VoteService voteService;

    public DiscussionService(DiscussionRepository discussionRepository, CommentRepository commentRepository,
                             UserRepository userRepository, VoteService voteService) {
        this.discussionRepository = discussionRepository;
        this.commentRepository = commentRepository;
        this.userRepository = userRepository;
        this.voteService = voteService;
    }

    /** Discussions for a problem, highest score first (newest first among ties). */
    @Transactional(readOnly = true)
    public List<DiscussionDto> listForProblem(String problemId) {
        List<Discussion> discussions = discussionRepository.findByProblemIdOrderByCreatedAtDesc(problemId);
        List<String> ids = discussions.stream().map(Discussion::getId).toList();

        Map<String, VoteTally> tallies = voteService.tallies(VoteService.DISCUSSION, ids);
        Map<String, Integer> commentCounts = ids.isEmpty() ? Map.of() : commentRepository.countByDiscussionIds(ids).stream()
                .collect(Collectors.toMap(DiscussionCommentCount::id, DiscussionCommentCount::count));
        Map<String, UserSummary> authors = authors(discussions.stream().map(Discussion::getUserId).toList());

        return discussions.stream()
                .map(d -> DiscussionDto.from(d,
                        author(authors, d.getUserId()),
                        tallies.getOrDefault(d.getId(), VoteTally.EMPTY),
                        commentCounts.getOrDefault(d.getId(), 0)))
                .sorted(Comparator.comparingLong(DiscussionDto::voteCount).reversed())
                .toList();
    }

    @Transactional
    public DiscussionDto create(String problemId, String userId, String title, String content) {
        User user = loadUser(userId);
        Discussion discussion = new Discussion();
        discussion.setProblemId(problemId);
        discussion.setUserId(userId);
        discussion.setTitle(title);
        discussion.setContent(content);
        return DiscussionDto.from(discussionRepository.save(discussion), UserSummary.from(user), VoteTally.EMPTY, 0);
    }

    /** Comments for a discussion as a tree of top-level comments with nested replies. */
    @Transactional(readOnly = true)
    public List<CommentDto> commentTree(String discussionId) {
        List<Comment> comments = commentRepository.findByDiscussionIdOrderByCreatedAtAsc(discussionId);
        Map<String, VoteTally> tallies = voteService.tallies(VoteService.COMMENT,
                comments.stream().map(Comment::getId).toList());
        Map<String, UserSummary> authors = authors(comments.stream().map(Comment::getUserId).toList());

        Map<String, CommentDto> byId = new LinkedHashMap<>();
        for (Comment c : comments) {
            byId.put(c.getId(), CommentDto.from(c, author(authors, c.getUserId()),
                    tallies.getOrDefault(c.getId(), VoteTally.EMPTY)));
        }

        List<CommentDto> roots = new ArrayList<>();
        for (CommentDto c : byId.values()) {
            if (c.parentId() == null) {
                roots.add(c);
            } else {
                CommentDto parent = byId.get(c.parentId());
                if (parent != null) {
                    parent.replies().add(c);
                }
            }
        }
        return roots;
    }

    @Transactional
    public CommentDto createComment(String discussionId, String parentId, String userId, String content) {
        if (!discussionRepository.existsById(discussionId)) {
            throw ApiException.notFound("Discussion not found");
        }
        User user = loadUser(userId);
        Comment comment = new Comment();
        comment.setDiscussionId(discussionId);
        comment.setParentId(parentId == null || parentId.isBlank() ? null : parentId);
        comment.setUserId(userId);
        comment.setContent(content);
        return CommentDto.from(commentRepository.save(comment), UserSummary.from(user), VoteTally.EMPTY);
    }

    /** Loads the authors of a page of discussions or comments in one query. */
    private Map<String, UserSummary> authors(Collection<String> userIds) {
        return userRepository.findAllById(userIds.stream().distinct().toList()).stream()
                .collect(Collectors.toMap(User::getId, UserSummary::from, (a, b) -> a));
    }

    private static UserSummary author(Map<String, UserSummary> authors, String userId) {
        return authors.getOrDefault(userId, UserSummary.deleted(userId));
    }

    private User loadUser(String userId) {
        return userRepository.findById(userId)
                .orElseThrow(() -> ApiException.unauthorized("Not authenticated"));
    }
}
