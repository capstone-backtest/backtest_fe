import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
import { Textarea } from '@/shared/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';
import { Label } from '@/shared/ui/label';
import { getAuthToken } from '@/features/auth/services/auth';
import { useCommunityPosts } from '@/features/community/hooks/useCommunityPosts';

const CommunityPage: React.FC = () => {
  const {
    posts,
    loading,
    error,
    actions: { createPost, reload },
  } = useCommunityPosts();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [submitError, setSubmitError] = useState<string | null>(null);

  const loggedIn = !!getAuthToken();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);
    try {
      await createPost(title, content);
      setTitle('');
      setContent('');
    } catch (err) {
      const message = err instanceof Error ? err.message : '게시글 등록에 실패했습니다.';
      setSubmitError(message);
    }
  };

  return (
    <div className="container mx-auto max-w-4xl px-4 py-10">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">커뮤니티</h1>
          <p className="text-muted-foreground">사용자들과 전략과 아이디어를 공유하세요.</p>
        </div>
        <Button variant="outline" onClick={reload} disabled={loading}>
          새로고침
        </Button>
      </div>

      {(error || submitError) && (
        <div className="mb-4 rounded border border-destructive/20 bg-destructive/10 p-3 text-destructive">
          {submitError ?? error}
        </div>
      )}

      {loggedIn ? (
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-lg">새 게시글 작성</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">제목</Label>
                <Input
                  id="title"
                  placeholder="제목을 입력하세요"
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="content">내용</Label>
                <Textarea
                  id="content"
                  placeholder="내용을 입력하세요"
                  value={content}
                  onChange={e => setContent(e.target.value)}
                  rows={4}
                  required
                />
              </div>
              <Button type="submit" disabled={loading}>
                게시하기
              </Button>
            </form>
          </CardContent>
        </Card>
      ) : (
        <div className="mb-8 rounded border border-dashed border-border/40 bg-muted/30 p-4 text-sm text-muted-foreground">
          게시글 작성은 로그인 후 이용 가능합니다.{' '}
          <Link className="font-medium text-primary underline" to="/login">
            로그인
          </Link>
        </div>
      )}

      <div className="space-y-4">
        {posts.map(post => (
          <Card key={post.id} className="hover:border-primary/40 hover:shadow-md">
            <Link to={`/community/${post.id}`}>
              <CardContent className="space-y-2 p-5">
                <div className="text-sm text-muted-foreground">
                  {post.username} • {new Date(post.created_at).toLocaleString()}
                </div>
                <div className="text-lg font-semibold text-foreground">{post.title}</div>
                {post.excerpt && (
                  <p className="line-clamp-3 whitespace-pre-wrap text-sm text-muted-foreground">
                    {post.excerpt}
                  </p>
                )}
              </CardContent>
            </Link>
          </Card>
        ))}

        {posts.length === 0 && !loading ? (
          <Card className="border-dashed">
            <CardContent className="py-10 text-center text-muted-foreground">
              아직 등록된 게시글이 없습니다.
            </CardContent>
          </Card>
        ) : null}
      </div>
    </div>
  );
};

export default CommunityPage;
