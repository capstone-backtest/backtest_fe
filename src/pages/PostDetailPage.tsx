import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { Button } from '@/shared/ui/button';
import { Textarea } from '@/shared/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';
import { Label } from '@/shared/ui/label';
import { getAuthToken } from '@/features/auth/services/auth';
import { usePostDetail } from '@/features/community/hooks/usePostDetail';

const PostDetailPage: React.FC = () => {
  const { id } = useParams();
  const postId = Number(id);
  const {
    data,
    loading,
    error,
    actions: { addComment, clearError },
  } = usePostDetail(Number.isNaN(postId) ? null : postId);
  const [content, setContent] = useState('');
  const [submitError, setSubmitError] = useState<string | null>(null);

  const loggedIn = !!getAuthToken();

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;
    setSubmitError(null);
    try {
      await addComment(content);
      setContent('');
    } catch (err) {
      const message = err instanceof Error ? err.message : '댓글 등록에 실패했습니다.';
      setSubmitError(message);
    }
  };

  if (Number.isNaN(postId)) {
    return (
      <div className="container mx-auto max-w-3xl px-4 py-10">
        <Card>
          <CardContent className="py-10 text-center text-destructive">
            잘못된 게시글입니다.
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-3xl px-4 py-10 space-y-6">
      {error && (
        <div className="rounded border border-destructive/20 bg-destructive/10 p-3 text-destructive">
          {error}
          <button type="button" className="ml-2 underline" onClick={clearError}>
            닫기
          </button>
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-2xl font-semibold">
            {loading && !data ? '로딩 중...' : data?.post.title ?? '게시글을 찾을 수 없습니다.'}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {data ? (
            <>
              <div className="text-sm text-muted-foreground">
                {data.post.username} • {new Date(data.post.created_at).toLocaleString()}
              </div>
              <div className="whitespace-pre-wrap text-base text-foreground">
                {data.post.content}
              </div>
            </>
          ) : (
            <div className="py-8 text-center text-muted-foreground">게시글을 불러오는 중입니다...</div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">댓글</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {data?.comments?.length ? (
            <div className="space-y-4">
              {data.comments.map(comment => (
                <div key={comment.id} className="rounded border border-border/50 bg-card/60 p-4">
                  <div className="text-sm text-muted-foreground">
                    {comment.username} • {new Date(comment.created_at).toLocaleString()}
                  </div>
                  <div className="mt-2 whitespace-pre-wrap text-sm text-foreground">
                    {comment.content}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="rounded border border-dashed border-border/40 bg-muted/20 p-4 text-center text-sm text-muted-foreground">
              아직 댓글이 없습니다.
            </div>
          )}

          {loggedIn ? (
            <form onSubmit={onSubmit} className="space-y-3">
              {submitError && (
                <div className="rounded border border-destructive/20 bg-destructive/10 p-2 text-sm text-destructive">
                  {submitError}
                </div>
              )}
              <div className="space-y-2">
                <Label htmlFor="comment">댓글 작성</Label>
                <Textarea
                  id="comment"
                  value={content}
                  onChange={e => setContent(e.target.value)}
                  rows={3}
                  placeholder="댓글을 입력하세요"
                  required
                />
              </div>
              <Button type="submit" disabled={loading}>
                댓글 등록
              </Button>
            </form>
          ) : (
            <div className="rounded border border-dashed border-border/40 bg-muted/20 p-3 text-sm text-muted-foreground">
              댓글 작성은 로그인 후 이용 가능합니다.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default PostDetailPage;
