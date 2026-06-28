'use client';

import { StatusBadge } from '@/components/status-badge';
import { Bubble, BubbleContent, BubbleReactions } from '@/components/ui/bubble';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { AUDIT_DOT_COLOR } from '@/constants';
import { useAuthStore } from '@/store/auth';
import { Application, ApplicationStatusEnum } from '@/types';
import { getReturnCommentCount } from '@/utils/application';
import { getInitials } from '@/utils/user';

import { Button } from '../ui/button';

interface ActivitySectionProps {
  app: Application;
}

export function ActivitySection({ app }: ActivitySectionProps) {
  const commentCount = getReturnCommentCount(app);
  const { user } = useAuthStore();

  return (
    <div className="rounded-lg border bg-card p-5">
      <div className="flex items-center justify-between mb-3">
        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
          Activity
        </p>
        {commentCount > 0 && (
          <p className="text-xs text-muted-foreground">
            {commentCount} comment{commentCount > 1 ? 's' : ''}
          </p>
        )}
      </div>
      {app.audit_logs.length === 0 ? (
        <p className="text-sm text-muted-foreground">No activity yet.</p>
      ) : (
        <div className="space-y-0 divide-y divide-border">
          {app.audit_logs.map((log) => {
            const returnedForChanges =
              log.from_status === 'under_review' && log.to_status === 'draft';

            return (
              <div key={log.id} className="flex gap-3 py-3">
                <div
                  className={`mt-1.5 h-2 w-2 rounded-full shrink-0 ${
                    AUDIT_DOT_COLOR[log.to_status] ?? 'bg-gray-400'
                  }`}
                />
                <div>
                  <div className="flex-wrap items-center gap-1.5 text-sm">
                    {log.actor.id === user?.id ? (
                      'You '
                    ) : (
                      <span className="font-bold">
                        {log.actor.first_name} {log.actor.last_name}{' '}
                      </span>
                    )}
                    {returnedForChanges ? (
                      'requested changes'
                    ) : (
                      <>
                        <span>moved to </span>
                        <StatusBadge status={log.to_status as ApplicationStatusEnum} />
                      </>
                    )}
                  </div>
                  {log.comment && (
                    <div className="pb-6">
                      <Bubble className="mt-2" variant="muted">
                        <BubbleContent>
                          <span className="text-sm italic">&quot;{log.comment}&quot;</span>
                        </BubbleContent>
                        <BubbleReactions align="start" role="img">
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button className="p-1" size="icon-xs" variant="ghost">
                                {getInitials(log.actor)}
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent className="flex flex-col items-start">
                              <span>
                                {log.actor.first_name} {log.actor.last_name}
                              </span>
                              <span>{log.actor.email}</span>
                            </TooltipContent>
                          </Tooltip>
                        </BubbleReactions>
                      </Bubble>
                    </div>
                  )}
                  <p className="text-xs text-muted-foreground mt-1.5">
                    {new Date(log.created_at).toLocaleString()}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
