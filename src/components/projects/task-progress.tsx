'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { CheckCircle2, Circle } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { toast } from 'sonner'
import type { ProjectTask, TaskPriority } from '@/types/database'
import type { Locale } from '@/app/[lang]/dictionaries'
import { Progress } from '@/components/ui/progress'

interface TaskProgressProps {
  projectId: string
  lang: Locale
}

export function TaskProgress({ projectId, lang }: TaskProgressProps) {
  const [tasks, setTasks] = useState<ProjectTask[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchTasks()
  }, [projectId])

  async function fetchTasks() {
    setLoading(true)
    try {
      const response = await fetch(`/api/projects/${projectId}/tasks`)
      if (!response.ok) throw new Error('Failed to fetch tasks')
      const data = await response.json()
      setTasks(data)
    } catch (error) {
      console.error('Error fetching tasks:', error)
      toast.error(
        lang === 'en' ? 'Error loading tasks' : 'Error al cargar tareas'
      )
    } finally {
      setLoading(false)
    }
  }

  const completedCount = tasks.filter(t => t.completed).length
  const totalCount = tasks.length
  const progressPercentage = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0

  // Priority configuration
  const priorityConfig = {
    low: {
      color: 'text-blue-600 dark:text-blue-400',
      bg: 'bg-blue-50 dark:bg-blue-950',
      border: 'border-blue-200 dark:border-blue-800',
      label: lang === 'en' ? 'Low' : 'Baja'
    },
    medium: {
      color: 'text-yellow-600 dark:text-yellow-400',
      bg: 'bg-yellow-50 dark:bg-yellow-950',
      border: 'border-yellow-200 dark:border-yellow-800',
      label: lang === 'en' ? 'Medium' : 'Media'
    },
    high: {
      color: 'text-orange-600 dark:text-orange-400',
      bg: 'bg-orange-50 dark:bg-orange-950',
      border: 'border-orange-200 dark:border-orange-800',
      label: lang === 'en' ? 'High' : 'Alta'
    },
    critical: {
      color: 'text-red-600 dark:text-red-400',
      bg: 'bg-red-50 dark:bg-red-950',
      border: 'border-red-200 dark:border-red-800',
      label: lang === 'en' ? 'Critical' : 'Crítica'
    }
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>
            {lang === 'en' ? 'Project Progress' : 'Progreso del Proyecto'}
          </CardTitle>
          <CardDescription>
            <Skeleton className="h-4 w-32" />
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Skeleton className="h-4 w-28" />
              <Skeleton className="h-4 w-12" />
            </div>
            <Skeleton className="h-3 w-full" />
          </div>
          <div className="space-y-3">
            <Skeleton className="h-4 w-36" />
            <div className="space-y-2">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-start gap-3 p-3 rounded-lg border">
                  <Skeleton className="h-5 w-5 rounded-full shrink-0" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-3 w-3/4" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (tasks.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>
            {lang === 'en' ? 'Project Progress' : 'Progreso del Proyecto'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground text-center py-8">
            {lang === 'en'
              ? 'No tasks have been defined for this project yet.'
              : 'Aún no se han definido tareas para este proyecto.'
            }
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          {lang === 'en' ? 'Project Progress' : 'Progreso del Proyecto'}
        </CardTitle>
        <CardDescription>
          {lang === 'en'
            ? `${completedCount} of ${totalCount} tasks completed`
            : `${completedCount} de ${totalCount} tareas completadas`
          }
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Progress bar with percentage */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="font-medium">
              {lang === 'en' ? 'Overall Progress' : 'Progreso General'}
            </span>
            <span className="text-muted-foreground">{progressPercentage}%</span>
          </div>
          <Progress value={progressPercentage} className="h-3" />
        </div>

        {/* Tasks list */}
        <div className="space-y-3">
          <h4 className="text-sm font-medium">
            {lang === 'en' ? 'Features & Tasks' : 'Funcionalidades y Tareas'}
          </h4>
          <div className="space-y-2">
            {tasks.map((task) => {
              const priority = task.priority || 'medium'
              const config = priorityConfig[priority as keyof typeof priorityConfig]

              return (
                <div
                  key={task.id}
                  className={`flex items-start gap-3 p-3 rounded-lg border ${
                    task.completed ? 'bg-accent/50' : 'bg-card'
                  }`}
                >
                  <div className="flex-shrink-0 mt-0.5">
                    {task.completed ? (
                      <CheckCircle2 className="h-5 w-5 text-green-600" />
                    ) : (
                      <Circle className="h-5 w-5 text-muted-foreground" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <p
                        className={`font-medium text-sm ${
                          task.completed ? 'line-through text-muted-foreground' : ''
                        }`}
                      >
                        {task.title}
                      </p>
                      <div className="flex items-center gap-1 flex-shrink-0">
                        {task.priority && (
                          <Badge
                            variant="outline"
                            className={`${config.bg} ${config.color} ${config.border} text-xs px-1.5 py-0`}
                          >
                            {config.label}
                          </Badge>
                        )}
                        {task.category && (
                          <Badge variant="secondary" className="text-xs px-1.5 py-0">
                            {task.category}
                          </Badge>
                        )}
                      </div>
                    </div>
                    {task.description && (
                      <p className="text-xs text-muted-foreground mt-1">
                        {task.description}
                      </p>
                    )}
                    {task.completed_at && (
                      <p className="text-xs text-green-600 dark:text-green-400 mt-1">
                        {lang === 'en' ? 'Completed on' : 'Completada el'}{' '}
                        {new Date(task.completed_at).toLocaleDateString(
                          lang === 'en' ? 'en-US' : 'es-MX',
                          {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                          }
                        )}
                      </p>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Summary */}
        {progressPercentage === 100 && (
          <div className="rounded-lg bg-green-50 dark:bg-green-950 p-4 border border-green-200 dark:border-green-800">
            <p className="text-sm font-medium text-green-800 dark:text-green-200">
              {lang === 'en'
                ? '🎉 All tasks completed! Your project is ready.'
                : '🎉 ¡Todas las tareas completadas! Tu proyecto está listo.'
              }
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
