import { useState } from 'react';
import { MessageCircle, Send, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { useGetCommentsBySubmission, useAddComment } from '../hooks/useQueries';
import { Comment } from '../backend';

interface CommentSectionProps {
  submissionId: string;
}

function CommentItem({ comment }: { comment: Comment }) {
  const formatTimestamp = (timestamp: bigint) => {
    const date = new Date(Number(timestamp) / 1000000);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);
    
    if (diffInHours < 1) {
      const diffInMinutes = Math.floor(diffInHours * 60);
      return `${diffInMinutes}m ago`;
    } else if (diffInHours < 24) {
      return `${Math.floor(diffInHours)}h ago`;
    } else {
      const diffInDays = Math.floor(diffInHours / 24);
      return `${diffInDays}d ago`;
    }
  };

  return (
    <div className="space-y-2 animate-fade-in-up">
      <div className="flex items-center justify-between">
        <span className="font-medium text-forest-700 dark:text-forest-300 text-sm">
          {comment.author}
        </span>
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          <Clock className="w-3 h-3" />
          {formatTimestamp(comment.timestamp)}
        </div>
      </div>
      <p className="text-sm text-foreground leading-relaxed pl-2 border-l-2 border-forest-200 dark:border-forest-800">
        {comment.content}
      </p>
    </div>
  );
}

export default function CommentSection({ submissionId }: CommentSectionProps) {
  const [newComment, setNewComment] = useState('');
  const [isExpanded, setIsExpanded] = useState(false);
  
  const { data: comments = [], isLoading } = useGetCommentsBySubmission(submissionId);
  const addCommentMutation = useAddComment();

  const handleSubmitComment = async () => {
    if (!newComment.trim()) return;

    try {
      await addCommentMutation.mutateAsync({
        submissionId,
        content: newComment.trim(),
      });
      setNewComment('');
    } catch (error) {
      console.error('Failed to add comment:', error);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      handleSubmitComment();
    }
  };

  // Sort comments by timestamp (newest first)
  const sortedComments = [...comments].sort((a, b) => Number(b.timestamp) - Number(a.timestamp));

  return (
    <div className="space-y-4">
      {/* Comments Header */}
      <div className="flex items-center justify-between">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center gap-2 text-forest-600 dark:text-forest-400 hover:text-forest-700 dark:hover:text-forest-300 hover:bg-forest-50 dark:hover:bg-forest-900/20 transition-all duration-200"
        >
          <MessageCircle className="w-4 h-4" />
          <span className="font-medium">
            {comments.length} {comments.length === 1 ? 'Comment' : 'Comments'}
          </span>
        </Button>
      </div>

      {/* Comments Section */}
      {isExpanded && (
        <Card className="border-forest-200 dark:border-forest-800 bg-gradient-to-br from-forest-50/30 to-ocean-50/30 dark:from-forest-950/20 dark:to-ocean-950/20 animate-slide-down">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <MessageCircle className="w-4 h-4 text-forest-500" />
              Community Discussion
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Add Comment Form */}
            <div className="space-y-3">
              <Textarea
                placeholder="Share your thoughts on this climate action..."
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                onKeyDown={handleKeyPress}
                className="min-h-[80px] resize-none border-forest-200 dark:border-forest-800 focus:border-forest-400 dark:focus:border-forest-600 bg-white/50 dark:bg-black/20 backdrop-blur-sm"
                maxLength={500}
              />
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">
                  {newComment.length}/500 characters • Press Ctrl+Enter to submit
                </span>
                <Button
                  onClick={handleSubmitComment}
                  disabled={!newComment.trim() || addCommentMutation.isPending}
                  size="sm"
                  className="bg-gradient-to-r from-forest-600 to-ocean-600 hover:from-forest-700 hover:to-ocean-700 text-white shadow-nature hover:shadow-glow transition-all duration-200 hover-lift"
                >
                  {addCommentMutation.isPending ? (
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      <Send className="w-3 h-3 mr-1" />
                      Post
                    </>
                  )}
                </Button>
              </div>
            </div>

            {/* Comments List */}
            {isLoading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="animate-pulse">
                    <div className="flex items-center justify-between mb-2">
                      <div className="h-4 bg-forest-200 dark:bg-forest-800 rounded w-24"></div>
                      <div className="h-3 bg-forest-200 dark:bg-forest-800 rounded w-16"></div>
                    </div>
                    <div className="h-12 bg-forest-200 dark:bg-forest-800 rounded"></div>
                  </div>
                ))}
              </div>
            ) : sortedComments.length > 0 ? (
              <div className="space-y-4">
                <Separator className="bg-forest-200 dark:bg-forest-800" />
                {sortedComments.map((comment, index) => (
                  <div key={comment.id} style={{ animationDelay: `${index * 0.1}s` }}>
                    <CommentItem comment={comment} />
                    {index < sortedComments.length - 1 && (
                      <Separator className="mt-4 bg-forest-100 dark:bg-forest-900" />
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6">
                <MessageCircle className="w-8 h-8 text-muted-foreground mx-auto mb-2 opacity-50" />
                <p className="text-sm text-muted-foreground">
                  No comments yet. Be the first to share your thoughts!
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
