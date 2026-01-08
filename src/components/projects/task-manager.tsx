'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import { Plus, Trash2, GripVertical } from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'
import { toast } from 'sonner'
import type { ProjectTask } from '@/types/database'
import type { Locale } from '@/app/[lang]/dictionaries'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'

interface TaskManagerProps {
  projectId: string
  lang: Locale
}

export function TaskManager({ projectId, lang }: TaskManagerProps) {
  const [tasks, setTasks] = useState<ProjectTask[]>([])
  const [loading, setLoading] = useState(true)
  const [isAddingTask, setIsAddingTask] = useState(false)
  const [newTaskTitle, setNewTaskTitle] = useState('')
  const [newTaskDescription, setNewTaskDescription] = useState('')
  const [dialogOpen, setDialogOpen] = useState(false)

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

  async function handleAddTask() {
    if (!newTaskTitle.trim()) {
      toast.error(
        lang === 'en' ? 'Task title is required' : 'El título de la tarea es requerido'
      )
      return
    }

    setIsAddingTask(true)
    try {
      const response = await fetch(`/api/projects/${projectId}/tasks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: newTaskTitle,
          description: newTaskDescription || undefined,
        }),
      })

      if (!response.ok) throw new Error('Failed to add task')

      const newTask = await response.json()
      setTasks([...tasks, newTask])
      setNewTaskTitle('')
      setNewTaskDescription('')
      setDialogOpen(false)
      toast.success(
        lang === 'en' ? 'Task added successfully' : 'Tarea agregada exitosamente'
      )
    } catch (error) {
      console.error('Error adding task:', error)
      toast.error(
        lang === 'en' ? 'Error adding task' : 'Error al agregar tarea'
      )
    } finally {
      setIsAddingTask(false)
    }
  }

  async function handleToggleTask(taskId: string, completed: boolean) {
    try {
      const response = await fetch(`/api/projects/${projectId}/tasks/${taskId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ completed }),
      })

      if (!response.ok) throw new Error('Failed to update task')

      const updatedTask = await response.json()
      setTasks(tasks.map(t => t.id === taskId ? updatedTask : t))
      toast.success(
        completed
          ? (lang === 'en' ? 'Task completed!' : '¡Tarea completada!')
          : (lang === 'en' ? 'Task marked as pending' : 'Tarea marcada como pendiente')
      )
    } catch (error) {
      console.error('Error updating task:', error)
      toast.error(
        lang === 'en' ? 'Error updating task' : 'Error al actualizar tarea'
      )
    }
  }

  async function handleDeleteTask(taskId: string) {
    if (!confirm(lang === 'en' ? 'Are you sure you want to delete this task?' : '¿Estás seguro de que quieres eliminar esta tarea?')) {
      return
    }

    try {
      const response = await fetch(`/api/projects/${projectId}/tasks/${taskId}`, {
        method: 'DELETE',
      })

      if (!response.ok) throw new Error('Failed to delete task')

      setTasks(tasks.filter(t => t.id !== taskId))
      toast.success(
        lang === 'en' ? 'Task deleted successfully' : 'Tarea eliminada exitosamente'
      )
    } catch (error) {
      console.error('Error deleting task:', error)
      toast.error(
        lang === 'en' ? 'Error deleting task' : 'Error al eliminar tarea'
      )
    }
  }

  const completedCount = tasks.filter(t => t.completed).length
  const totalCount = tasks.length
  const progressPercentage = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>
            {lang === 'en' ? 'Project Tasks' : 'Tareas del Proyecto'}
          </CardTitle>
          <CardDescription>
            <Skeleton className="h-4 w-32" />
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-start gap-3 p-3 rounded-lg border">
              <Skeleton className="h-5 w-5" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-3 w-2/3" />
              </div>
              <Skeleton className="h-8 w-8" />
            </div>
          ))}
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <CardTitle>
              {lang === 'en' ? 'Project Tasks' : 'Tareas del Proyecto'}
            </CardTitle>
            <CardDescription>
              {lang === 'en'
                ? `${completedCount} of ${totalCount} tasks completed (${progressPercentage}%)`
                : `${completedCount} de ${totalCount} tareas completadas (${progressPercentage}%)`
              }
            </CardDescription>
          </div>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm">
                <Plus className="h-4 w-4 mr-2" />
                {lang === 'en' ? 'Add Task' : 'Agregar Tarea'}
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>
                  {lang === 'en' ? 'Add New Task' : 'Agregar Nueva Tarea'}
                </DialogTitle>
                <DialogDescription>
                  {lang === 'en'
                    ? 'Create a new task or feature for this project'
                    : 'Crea una nueva tarea o funcionalidad para este proyecto'
                  }
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="title">
                    {lang === 'en' ? 'Title' : 'Título'}
                  </Label>
                  <Input
                    id="title"
                    placeholder={lang === 'en' ? 'Task title...' : 'Título de la tarea...'}
                    value={newTaskTitle}
                    onChange={(e) => setNewTaskTitle(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">
                    {lang === 'en' ? 'Description (optional)' : 'Descripción (opcional)'}
                  </Label>
                  <Textarea
                    id="description"
                    placeholder={lang === 'en' ? 'Task description...' : 'Descripción de la tarea...'}
                    value={newTaskDescription}
                    onChange={(e) => setNewTaskDescription(e.target.value)}
                    rows={3}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setDialogOpen(false)}
                  disabled={isAddingTask}
                >
                  {lang === 'en' ? 'Cancel' : 'Cancelar'}
                </Button>
                <Button onClick={handleAddTask} disabled={isAddingTask}>
                  {isAddingTask ? (
                    lang === 'en' ? 'Adding...' : 'Agregando...'
                  ) : (
                    lang === 'en' ? 'Add Task' : 'Agregar Tarea'
                  )}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        {/* Progress bar */}
        {totalCount > 0 && (
          <div className="mb-6">
            <div className="w-full bg-muted rounded-full h-2">
              <div
                className="bg-primary h-2 rounded-full transition-all"
                style={{ width: `${progressPercentage}%` }}
              />
            </div>
          </div>
        )}

        {/* Tasks list */}
        {tasks.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-8">
            {lang === 'en'
              ? 'No tasks yet. Add your first task to track progress.'
              : 'No hay tareas aún. Agrega tu primera tarea para hacer seguimiento del progreso.'
            }
          </p>
        ) : (
          <div className="space-y-3">
            {tasks.map((task) => (
              <div
                key={task.id}
                className="flex items-start gap-3 p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
              >
                <GripVertical className="h-5 w-5 text-muted-foreground mt-0.5 cursor-grab" />
                <div className="flex items-start gap-3 flex-1">
                  <Checkbox
                    checked={task.completed}
                    onCheckedChange={(checked) =>
                      handleToggleTask(task.id, checked as boolean)
                    }
                    className="mt-1"
                  />
                  <div className="flex-1 min-w-0">
                    <p className={`font-medium ${task.completed ? 'line-through text-muted-foreground' : ''}`}>
                      {task.title}
                    </p>
                    {task.description && (
                      <p className="text-sm text-muted-foreground mt-1">
                        {task.description}
                      </p>
                    )}
                    {task.completed_at && (
                      <p className="text-xs text-muted-foreground mt-1">
                        {lang === 'en' ? 'Completed' : 'Completada'}: {new Date(task.completed_at).toLocaleDateString(lang === 'en' ? 'en-US' : 'es-MX', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </p>
                    )}
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleDeleteTask(task.id)}
                  className="text-destructive hover:text-destructive"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
