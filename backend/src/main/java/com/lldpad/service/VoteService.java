package com.lldpad.service;

import com.lldpad.dto.Dtos.VoteResult;
import com.lldpad.dto.Dtos.VoteTally;
import com.lldpad.entity.Vote;
import com.lldpad.repository.CommentRepository;
import com.lldpad.repository.DiscussionRepository;
import com.lldpad.repository.VoteRepository;
import com.lldpad.web.ApiException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Collection;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class VoteService {

    public static final String DISCUSSION = "discussion";
    public static final String COMMENT = "comment";

    private final VoteRepository voteRepository;
    private final DiscussionRepository discussionRepository;
    private final CommentRepository commentRepository;

    public VoteService(VoteRepository voteRepository, DiscussionRepository discussionRepository,
                       CommentRepository commentRepository) {
        this.voteRepository = voteRepository;
        this.discussionRepository = discussionRepository;
        this.commentRepository = commentRepository;
    }

    /** Vote tallies for many targets of one type in a single query. */
    public Map<String, VoteTally> tallies(String targetType, Collection<String> targetIds) {
        if (targetIds.isEmpty()) {
            return Map.of();
        }
        return voteRepository.findByTargetTypeAndTargetIdIn(targetType, targetIds).stream()
                .collect(Collectors.groupingBy(Vote::getTargetId,
                        Collectors.collectingAndThen(Collectors.toList(), VoteTally::of)));
    }

    /**
     * Casts a vote. Repeating the same vote removes it, voting the other way flips it.
     * The denormalized up/down counts on the target are refreshed afterwards.
     */
    @Transactional
    public VoteResult vote(String userId, String targetType, String targetId, int value) {
        boolean targetExists = DISCUSSION.equals(targetType)
                ? discussionRepository.existsById(targetId)
                : commentRepository.existsById(targetId);
        if (!targetExists) {
            throw ApiException.notFound(targetType + " not found");
        }

        Optional<Vote> existing = voteRepository.findByUserIdAndTargetTypeAndTargetId(userId, targetType, targetId);
        String action;
        Vote vote;
        if (existing.isPresent() && existing.get().getValue() == value) {
            voteRepository.delete(existing.get());
            action = "removed";
            vote = null;
        } else if (existing.isPresent()) {
            vote = existing.get();
            vote.setValue(value);
            vote = voteRepository.save(vote);
            action = "updated";
        } else {
            vote = new Vote();
            vote.setUserId(userId);
            vote.setTargetType(targetType);
            vote.setTargetId(targetId);
            vote.setValue(value);
            vote = voteRepository.save(vote);
            action = "created";
        }

        List<Vote> votes = voteRepository.findByTargetTypeAndTargetId(targetType, targetId);
        VoteTally tally = VoteTally.of(votes);
        int up = (int) tally.upvotes();
        int down = (int) tally.downvotes();
        if (DISCUSSION.equals(targetType)) {
            discussionRepository.findById(targetId).ifPresent(d -> {
                d.setUpvotes(up);
                d.setDownvotes(down);
                discussionRepository.save(d);
            });
        } else {
            commentRepository.findById(targetId).ifPresent(c -> {
                c.setUpvotes(up);
                c.setDownvotes(down);
                commentRepository.save(c);
            });
        }

        return new VoteResult(action, vote, tally.voteCount(), tally.upvotes(), tally.downvotes());
    }
}
