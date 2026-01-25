"use client";

import { useState, useEffect } from "react";

interface Discussion {
  id: string;
  title: string;
  content: string;
  createdAt: string;
  user: {
    id: string;
    username: string;
  };
  voteCount: number;
  upvotes: number;
  downvotes: number;
  commentCount: number;
  userVote?: number;
}

interface Comment {
  id: string;
  content: string;
  createdAt: string;
  user: {
    id: string;
    username: string;
  };
  voteCount: number;
  upvotes: number;
  downvotes: number;
  parentId: string | null;
  replies: Comment[];
  userVote?: number;
}

interface DiscussionTabProps {
  problemId: string;
}

export default function DiscussionTab({ problemId }: DiscussionTabProps) {
  const [discussions, setDiscussions] = useState<Discussion[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newContent, setNewContent] = useState("");
  const [selectedDiscussion, setSelectedDiscussion] = useState<Discussion | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState("");
  const [userVotes, setUserVotes] = useState<Record<string, number>>({});

  const loadDiscussions = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/discussions?problemId=${problemId}`);
      if (response.ok) {
        const data = await response.json();
        setDiscussions(data);
      }
    } catch (error) {
      console.error("Error loading discussions:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDiscussions();
  }, [problemId]);

  const loadComments = async (discussionId: string) => {
    try {
      const response = await fetch(`/api/comments?discussionId=${discussionId}`);
      if (response.ok) {
        const data = await response.json();
        setComments(data);
      }
    } catch (error) {
      console.error("Error loading comments:", error);
    }
  };

  const handleCreateDiscussion = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch("/api/discussions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          problemId,
          title: newTitle,
          content: newContent,
        }),
      });

      if (response.ok) {
        const discussion = await response.json();
        setDiscussions([discussion, ...discussions]);
        setNewTitle("");
        setNewContent("");
        setShowCreateForm(false);
      }
    } catch (error) {
      console.error("Error creating discussion:", error);
    }
  };

  const handleVote = async (targetType: "discussion" | "comment", targetId: string) => {
    const voteKey = `${targetType}-${targetId}`;
    const currentVote = userVotes[voteKey];
    
    if (currentVote === 1) {
      return;
    }

    try {
      const response = await fetch("/api/votes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          targetType,
          targetId,
          value: 1,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        const newVote = currentVote === 1 ? undefined : 1;
        setUserVotes(prev => {
          const updated = { ...prev };
          if (newVote === undefined) {
            delete updated[voteKey];
          } else {
            updated[voteKey] = newVote;
          }
          return updated;
        });

        if (targetType === "discussion") {
          setDiscussions(discussions.map(d => 
            d.id === targetId ? { 
              ...d, 
              voteCount: data.voteCount,
              upvotes: data.upvotes,
              downvotes: data.downvotes,
              userVote: newVote,
            } : d
          ));
        } else {
          const updateCommentVote = (comments: Comment[]): Comment[] => {
            return comments.map(c => {
              if (c.id === targetId) {
                return { 
                  ...c, 
                  voteCount: data.voteCount,
                  upvotes: data.upvotes,
                  downvotes: data.downvotes,
                  userVote: newVote,
                };
              }
              if (c.replies.length > 0) {
                return { ...c, replies: updateCommentVote(c.replies) };
              }
              return c;
            });
          };
          setComments(updateCommentVote(comments));
        }
      }
    } catch (error) {
      console.error("Error voting:", error);
      loadDiscussions();
      if (selectedDiscussion) {
        loadComments(selectedDiscussion.id);
      }
    }
  };

  const handleDownvote = async (targetType: "discussion" | "comment", targetId: string) => {
    const voteKey = `${targetType}-${targetId}`;
    const currentVote = userVotes[voteKey];
    
    if (currentVote === -1) {
      return;
    }

    try {
      const response = await fetch("/api/votes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          targetType,
          targetId,
          value: -1,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        const newVote = currentVote === -1 ? undefined : -1;
        setUserVotes(prev => {
          const updated = { ...prev };
          if (newVote === undefined) {
            delete updated[voteKey];
          } else {
            updated[voteKey] = newVote;
          }
          return updated;
        });

        if (targetType === "discussion") {
          setDiscussions(discussions.map(d => 
            d.id === targetId ? { 
              ...d, 
              voteCount: data.voteCount,
              upvotes: data.upvotes,
              downvotes: data.downvotes,
              userVote: newVote,
            } : d
          ));
        } else {
          const updateCommentVote = (comments: Comment[]): Comment[] => {
            return comments.map(c => {
              if (c.id === targetId) {
                return { 
                  ...c, 
                  voteCount: data.voteCount,
                  upvotes: data.upvotes,
                  downvotes: data.downvotes,
                  userVote: newVote,
                };
              }
              if (c.replies.length > 0) {
                return { ...c, replies: updateCommentVote(c.replies) };
              }
              return c;
            });
          };
          setComments(updateCommentVote(comments));
        }
      }
    } catch (error) {
      console.error("Error voting:", error);
      loadDiscussions();
      if (selectedDiscussion) {
        loadComments(selectedDiscussion.id);
      }
    }
  };

  const handleCreateComment = async (e: React.FormEvent, parentId?: string) => {
    e.preventDefault();
    if (!selectedDiscussion) return;

    try {
      const response = await fetch("/api/comments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          discussionId: selectedDiscussion.id,
          parentId: parentId || null,
          content: parentId ? replyContent : newComment,
        }),
      });

      if (response.ok) {
        const comment = await response.json();
        if (parentId) {
          const addReply = (comments: Comment[]): Comment[] => {
            return comments.map(c => {
              if (c.id === parentId) {
                return { ...c, replies: [...c.replies, comment] };
              }
              if (c.replies.length > 0) {
                return { ...c, replies: addReply(c.replies) };
              }
              return c;
            });
          };
          setComments(addReply(comments));
        } else {
          setComments([...comments, comment]);
        }
        setNewComment("");
        setReplyContent("");
        setReplyingTo(null);
      }
    } catch (error) {
      console.error("Error creating comment:", error);
    }
  };

  const openDiscussion = (discussion: Discussion) => {
    setSelectedDiscussion(discussion);
    loadComments(discussion.id);
  };

  const renderComment = (comment: Comment, depth: number = 0) => {
    return (
      <div key={comment.id} className={`mb-4 ${depth > 0 ? "ml-8 border-l-2 border-gray-700 pl-4" : ""}`}>
        <div className="flex gap-3">
          <div className="flex flex-col items-center gap-1 min-w-[40px]">
            <button
              onClick={() => handleVote("comment", comment.id)}
              disabled={userVotes[`comment-${comment.id}`] === 1}
              className={`transition-colors text-lg leading-none ${
                userVotes[`comment-${comment.id}`] === 1
                  ? "text-green-500 cursor-not-allowed"
                  : "text-gray-400 hover:text-green-400"
              }`}
              title={userVotes[`comment-${comment.id}`] === 1 ? "Already upvoted" : "Upvote"}
            >
              ▲
            </button>
            <span className="text-sm font-medium text-gray-300">{comment.voteCount}</span>
            <button
              onClick={() => handleDownvote("comment", comment.id)}
              disabled={userVotes[`comment-${comment.id}`] === -1}
              className={`transition-colors text-lg leading-none ${
                userVotes[`comment-${comment.id}`] === -1
                  ? "text-red-500 cursor-not-allowed"
                  : "text-gray-400 hover:text-red-400"
              }`}
              title={userVotes[`comment-${comment.id}`] === -1 ? "Already downvoted" : "Downvote"}
            >
              ▼
            </button>
            <div className="text-xs text-gray-500 mt-1">
              <div className="text-green-500">+{comment.upvotes}</div>
              <div className="text-red-500">-{comment.downvotes}</div>
            </div>
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 text-sm text-gray-400 mb-2">
              <span className="font-medium text-gray-300">{comment.user.username}</span>
              <span>·</span>
              <span>{new Date(comment.createdAt).toLocaleDateString()}</span>
            </div>
            <div className="text-sm text-gray-200 mb-3 whitespace-pre-wrap leading-relaxed">{comment.content}</div>
            <button
              onClick={() => setReplyingTo(replyingTo === comment.id ? null : comment.id)}
              className="text-xs text-blue-400 hover:text-blue-300 font-medium transition-colors"
            >
              {replyingTo === comment.id ? "Cancel" : "Reply"}
            </button>
            {replyingTo === comment.id && (
              <form onSubmit={(e) => handleCreateComment(e, comment.id)} className="mt-3 p-3 bg-gray-800 rounded-lg border border-gray-700">
                <textarea
                  value={replyContent}
                  onChange={(e) => setReplyContent(e.target.value)}
                  className="w-full bg-gray-700 text-gray-200 p-2 rounded-lg text-sm mb-2 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                  rows={3}
                  placeholder="Write a reply..."
                />
                <div className="flex gap-2">
                  <button
                    type="submit"
                    className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors"
                  >
                    Post Reply
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setReplyingTo(null);
                      setReplyContent("");
                    }}
                    className="px-4 py-1.5 bg-gray-700 hover:bg-gray-600 text-gray-200 text-sm font-medium rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}
            {comment.replies.map((reply) => renderComment(reply, depth + 1))}
          </div>
        </div>
      </div>
    );
  };

  if (selectedDiscussion) {
    return (
      <div className="h-full flex flex-col p-5">
        <button
          onClick={() => {
            setSelectedDiscussion(null);
            setComments([]);
          }}
          className="text-blue-400 hover:text-blue-300 mb-5 text-sm font-medium transition-colors flex items-center gap-1"
        >
          <span>←</span> Back to discussions
        </button>

        <div className="mb-6 pb-6 border-b border-gray-700">
          <div className="flex-1 min-w-0">
            <h2 className="text-xl font-bold mb-3 text-gray-100">{selectedDiscussion.title}</h2>
            <div className="flex items-center gap-2 text-sm text-gray-400 mb-4">
              <span className="font-medium text-gray-300">{selectedDiscussion.user.username}</span>
              <span>·</span>
              <span>{new Date(selectedDiscussion.createdAt).toLocaleDateString()}</span>
            </div>
            <div className="text-sm text-gray-200 whitespace-pre-wrap leading-relaxed mb-4">{selectedDiscussion.content}</div>
            
            <div className="flex items-center gap-4 mt-4 pt-4 border-t border-gray-700">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleVote("discussion", selectedDiscussion.id)}
                  disabled={userVotes[`discussion-${selectedDiscussion.id}`] === 1}
                  className={`transition-colors text-lg font-bold px-3 py-1.5 rounded ${
                    userVotes[`discussion-${selectedDiscussion.id}`] === 1
                      ? "bg-green-600 text-white cursor-not-allowed"
                      : "bg-gray-700 text-gray-300 hover:bg-green-600 hover:text-white"
                  }`}
                  title={userVotes[`discussion-${selectedDiscussion.id}`] === 1 ? "Already upvoted" : "Upvote"}
                >
                  ▲ Upvote
                </button>
                <span className="text-base font-semibold text-gray-300 px-2">{selectedDiscussion.voteCount}</span>
                <button
                  onClick={() => handleDownvote("discussion", selectedDiscussion.id)}
                  disabled={userVotes[`discussion-${selectedDiscussion.id}`] === -1}
                  className={`transition-colors text-lg font-bold px-3 py-1.5 rounded ${
                    userVotes[`discussion-${selectedDiscussion.id}`] === -1
                      ? "bg-red-600 text-white cursor-not-allowed"
                      : "bg-gray-700 text-gray-300 hover:bg-red-600 hover:text-white"
                  }`}
                  title={userVotes[`discussion-${selectedDiscussion.id}`] === -1 ? "Already downvoted" : "Downvote"}
                >
                  ▼ Downvote
                </button>
              </div>
              <div className="flex items-center gap-2 text-xs text-gray-500">
                <span className="text-green-500">+{selectedDiscussion.upvotes} upvotes</span>
                <span>·</span>
                <span className="text-red-500">-{selectedDiscussion.downvotes} downvotes</span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          <h3 className="text-lg font-semibold mb-5 text-gray-200">
            Comments ({comments.length})
          </h3>
          {comments.length === 0 ? (
            <div className="text-center text-gray-400 py-8">
              No comments yet. Be the first to comment!
            </div>
          ) : (
            comments.map((comment) => renderComment(comment))
          )}

          <div className="mt-8 p-4 bg-gray-800 rounded-lg border border-gray-700">
            <h4 className="text-sm font-semibold mb-3 text-gray-300">Add a Comment</h4>
            <form onSubmit={handleCreateComment}>
              <textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                className="w-full bg-gray-700 text-gray-200 p-3 rounded-lg text-sm mb-3 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                rows={4}
                placeholder="Write a comment..."
              />
              <button
                type="submit"
                className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors"
              >
                Post Comment
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col p-5">
      <div className="flex justify-between items-center mb-5">
        <h2 className="text-xl font-bold text-gray-100">Discussions</h2>
        <button
          onClick={() => setShowCreateForm(!showCreateForm)}
          className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors"
        >
          {showCreateForm ? "Cancel" : "+ New Discussion"}
        </button>
      </div>

      {showCreateForm && (
        <form onSubmit={handleCreateDiscussion} className="mb-6 p-5 bg-gray-800 rounded-lg border border-gray-700">
          <h3 className="text-lg font-semibold mb-4 text-gray-200">Create New Discussion</h3>
          <input
            type="text"
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            className="w-full bg-gray-700 text-gray-200 p-3 rounded-lg text-sm mb-3 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Discussion title..."
            required
          />
          <textarea
            value={newContent}
            onChange={(e) => setNewContent(e.target.value)}
            className="w-full bg-gray-700 text-gray-200 p-3 rounded-lg text-sm mb-3 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            rows={5}
            placeholder="Share your thoughts, ask questions, or discuss solutions..."
            required
          />
          <div className="flex gap-2">
            <button
              type="submit"
              className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors"
            >
              Create Discussion
            </button>
            <button
              type="button"
              onClick={() => {
                setShowCreateForm(false);
                setNewTitle("");
                setNewContent("");
              }}
              className="px-5 py-2 bg-gray-700 hover:bg-gray-600 text-gray-200 text-sm font-medium rounded-lg transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {loading ? (
        <div className="text-center text-gray-400 py-8">Loading discussions...</div>
      ) : discussions.length === 0 ? (
        <div className="text-center text-gray-400 py-8">No discussions yet. Be the first to start one!</div>
      ) : (
        <div className="flex-1 overflow-y-auto">
          {discussions.map((discussion) => (
            <div
              key={discussion.id}
              onClick={() => openDiscussion(discussion)}
              className="p-5 mb-4 bg-gray-800 rounded-lg border border-gray-700 cursor-pointer hover:border-gray-600 hover:bg-gray-750 transition-all"
            >
              <div className="flex flex-col">
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold mb-2 text-gray-100">{discussion.title}</h3>
                  <p className="text-sm text-gray-400 mb-3 line-clamp-2 leading-relaxed">{discussion.content}</p>
                  <div className="flex items-center gap-3 text-xs text-gray-500 mb-3">
                    <span className="font-medium text-gray-400">{discussion.user.username}</span>
                    <span>·</span>
                    <span>{new Date(discussion.createdAt).toLocaleDateString()}</span>
                    <span>·</span>
                    <span className="text-blue-400">{discussion.commentCount} {discussion.commentCount === 1 ? 'comment' : 'comments'}</span>
                </div>
              </div>
                
                <div className="flex items-center gap-4 pt-3 border-t border-gray-700" onClick={(e) => e.stopPropagation()}>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleVote("discussion", discussion.id);
                      }}
                      disabled={userVotes[`discussion-${discussion.id}`] === 1}
                      className={`transition-colors text-sm font-bold px-3 py-1.5 rounded ${
                        userVotes[`discussion-${discussion.id}`] === 1
                          ? "bg-green-600 text-white cursor-not-allowed"
                          : "bg-gray-700 text-gray-300 hover:bg-green-600 hover:text-white"
                      }`}
                      title={userVotes[`discussion-${discussion.id}`] === 1 ? "Already upvoted" : "Upvote"}
                    >
                      ▲ 
                    </button>
                    <span className="text-sm font-semibold text-gray-300 px-2">{discussion.voteCount}</span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDownvote("discussion", discussion.id);
                      }}
                      disabled={userVotes[`discussion-${discussion.id}`] === -1}
                      className={`transition-colors text-sm font-bold px-3 py-1.5 rounded ${
                        userVotes[`discussion-${discussion.id}`] === -1
                          ? "bg-red-600 text-white cursor-not-allowed"
                          : "bg-gray-700 text-gray-300 hover:bg-red-600 hover:text-white"
                      }`}
                      title={userVotes[`discussion-${discussion.id}`] === -1 ? "Already downvoted" : "Downvote"}
                    >
                      ▼ 
                    </button>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <span className="text-green-500">+{discussion.upvotes}</span>
                    <span>·</span>
                    <span className="text-red-500">-{discussion.downvotes}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

