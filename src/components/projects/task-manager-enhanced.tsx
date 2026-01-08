'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import { Skeleton } from '@/components/ui/skeleton'
import { Plus, Trash2, GripVertical, AlertCircle, Flag } from 'lucide-react'
import { toast } from 'sonner'
import type { ProjectTask, TaskPriority } from '@/types/database'
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { Badge } from '@/components/ui/badge'

interface TaskManagerProps {
  projectId: string
  lang: Locale
}

interface SortableTaskProps {
  task: ProjectTask
  lang: Locale
  onToggle: (taskId: string, completed: boolean) => void
  onDelete: (taskId: string) => void
  onEdit: (task: ProjectTask) => void
}

function SortableTask({ task, lang, onToggle, onDelete, onEdit }: SortableTaskProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  const priorityConfig = {
    low: { color: 'text-blue-600', bg: 'bg-blue-50 dark:bg-blue-950', label: lang === 'en' ? 'Low' : 'Baja' },
    medium: { color: 'text-yellow-600', bg: 'bg-yellow-50 dark:bg-yellow-950', label: lang === 'en' ? 'Medium' : 'Media' },
    high: { color: 'text-orange-600', bg: 'bg-orange-50 dark:bg-orange-950', label: lang === 'en' ? 'High' : 'Alta' },
    critical: { color: 'text-red-600', bg: 'bg-red-50 dark:bg-red-950', label: lang === 'en' ? 'Critical' : 'Crítica' },
  }

  const priority = task.priority || 'medium'
  const priorityStyle = priorityConfig[priority]

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`flex items-center gap-3 p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors cursor-pointer ${
        task.completed ? 'opacity-60' : ''
      }`}
      onClick={(e) => {
        // No abrir edición si se hace click en el checkbox, botón de eliminar o grip
        if (
          (e.target as HTMLElement).closest('button') ||
          (e.target as HTMLElement).closest('[role="checkbox"]') ||
          (e.target as HTMLElement).closest('.cursor-grab')
        ) {
          return
        }
        onEdit(task)
      }}
    >
      <div
        {...attributes}
        {...listeners}
        className="cursor-grab active:cursor-grabbing"
      >
        <GripVertical className="h-5 w-5 text-muted-foreground" />
      </div>
      <div className="flex items-center gap-3 flex-1">
        <Checkbox
          checked={task.completed}
          onCheckedChange={(checked) => onToggle(task.id, checked as boolean)}
          onClick={(e) => e.stopPropagation()}
          className="!border-2 !border-primary data-[state=checked]:border-primary"
        />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <p className={`font-medium ${task.completed ? 'line-through text-muted-foreground' : ''}`}>
              {task.title}
            </p>
            {task.priority && task.priority !== 'medium' && (
              <Badge variant="outline" className={`${priorityStyle.bg} ${priorityStyle.color} border-0 text-xs`}>
                <Flag className="h-3 w-3 mr-1" />
                {priorityStyle.label}
              </Badge>
            )}
            {task.category && (
              <Badge variant="outline" className="text-xs">
                {task.category}
              </Badge>
            )}
          </div>
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
        onClick={(e) => {
          e.stopPropagation()
          onDelete(task.id)
        }}
        className="text-destructive hover:text-destructive flex-shrink-0"
      >
        <Trash2 className="h-4 w-4" />
      </Button>
    </div>
  )
}

export function TaskManagerEnhanced({ projectId, lang }: TaskManagerProps) {
  const [tasks, setTasks] = useState<ProjectTask[]>([])
  const [loading, setLoading] = useState(true)
  const [isAddingTask, setIsAddingTask] = useState(false)
  const [newTaskTitle, setNewTaskTitle] = useState('')
  const [newTaskDescription, setNewTaskDescription] = useState('')
  const [newTaskPriority, setNewTaskPriority] = useState<TaskPriority>('medium')
  const [newTaskCategory, setNewTaskCategory] = useState('')
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingTask, setEditingTask] = useState<ProjectTask | null>(null)
  const [filterCategory, setFilterCategory] = useState<string>('all')
  const [filterPriority, setFilterPriority] = useState<string>('all')

  // Categorías predefinidas
  const predefinedCategories = [
    'Frontend',
    'Backend',
    'Database',
    'API',
    'Testing',
    'Design',
    'Documentation',
    'DevOps',
    'Security',
    'Performance',
    'Bug Fix',
    'Feature',
    'Refactor',
    'Integration',
    'Mobile',
    'Desktop',
    'Other',
  ]

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  useEffect(() => {
    fetchTasks()
  }, [projectId])

  async function fetchTasks() {
    setLoading(true)
    try {
      const response = await fetch(`/api/projects/${projectId}/tasks`)
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }))
        throw new Error(errorData.error || 'Failed to fetch tasks')
      }
      const data = await response.json()
      setTasks(data)
    } catch (error) {
      console.error('Error fetching tasks:', error)
      const errorMessage = error instanceof Error ? error.message : (lang === 'en' ? 'Error loading tasks' : 'Error al cargar tareas')
      toast.error(
        lang === 'en' ? 'Error loading tasks' : 'Error al cargar tareas',
        {
          description: errorMessage,
        }
      )
    } finally {
      setLoading(false)
    }
  }

  function handleEditTask(task: ProjectTask) {
    setEditingTask(task)
    setNewTaskTitle(task.title)
    setNewTaskDescription(task.description || '')
    setNewTaskPriority(task.priority || 'medium')
    setNewTaskCategory(task.category || '')
    setDialogOpen(true)
  }

  function handleCloseDialog() {
    setDialogOpen(false)
    setEditingTask(null)
    setNewTaskTitle('')
    setNewTaskDescription('')
    setNewTaskPriority('medium')
    setNewTaskCategory('')
  }

  async function handleSaveTask() {
    if (!newTaskTitle.trim()) {
      toast.error(
        lang === 'en' ? 'Task title is required' : 'El título de la tarea es requerido'
      )
      return
    }

    setIsAddingTask(true)
    try {
      const url = editingTask
        ? `/api/projects/${projectId}/tasks/${editingTask.id}`
        : `/api/projects/${projectId}/tasks`
      
      const method = editingTask ? 'PATCH' : 'POST'

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: newTaskTitle,
          description: newTaskDescription || undefined,
          priority: newTaskPriority,
          category: newTaskCategory || undefined,
        }),
      })

      if (!response.ok) throw new Error(editingTask ? 'Failed to update task' : 'Failed to add task')

      const updatedTask = await response.json()
      
      if (editingTask) {
        setTasks(tasks.map(t => t.id === editingTask.id ? updatedTask : t))
        toast.success(
          lang === 'en' ? 'Task updated successfully' : 'Tarea actualizada exitosamente'
        )
      } else {
        setTasks([...tasks, updatedTask])
        toast.success(
          lang === 'en' ? 'Task added successfully' : 'Tarea agregada exitosamente'
        )
      }
      
      handleCloseDialog()
    } catch (error) {
      console.error('Error saving task:', error)
      toast.error(
        lang === 'en' ? (editingTask ? 'Error updating task' : 'Error adding task') : (editingTask ? 'Error al actualizar tarea' : 'Error al agregar tarea')
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

  async function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event

    if (!over || active.id === over.id) return

    const oldIndex = tasks.findIndex(t => t.id === active.id)
    const newIndex = tasks.findIndex(t => t.id === over.id)

    const newTasks = arrayMove(tasks, oldIndex, newIndex)
    setTasks(newTasks)

    // Update order_index in backend
    try {
      await Promise.all(
        newTasks.map((task, index) =>
          fetch(`/api/projects/${projectId}/tasks/${task.id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ order_index: index }),
          })
        )
      )
    } catch (error) {
      console.error('Error updating task order:', error)
      toast.error(
        lang === 'en' ? 'Error updating task order' : 'Error al actualizar el orden de tareas'
      )
      fetchTasks() // Reload to get correct order
    }
  }

  const completedCount = tasks.filter(t => t.completed).length
  const totalCount = tasks.length
  const progressPercentage = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0

  // Get unique categories
  const categories = Array.from(new Set(tasks.map(t => t.category).filter(Boolean))) as string[]

  // Filter tasks
  const filteredTasks = tasks.filter(task => {
    if (filterCategory !== 'all' && task.category !== filterCategory) return false
    if (filterPriority !== 'all' && task.priority !== filterPriority) return false
    return true
  })

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <CardTitle>
                {lang === 'en' ? 'Project Tasks' : 'Tareas del Proyecto'}
              </CardTitle>
              <CardDescription>
                <Skeleton className="h-4 w-32" />
              </CardDescription>
            </div>
            <Skeleton className="h-9 w-24" />
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Skeleton className="h-4 w-28" />
            <Skeleton className="h-3 w-full" />
          </div>
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="flex items-start gap-3 p-3 rounded-lg border">
              <Skeleton className="h-5 w-5" />
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
          <Dialog open={dialogOpen} onOpenChange={(open) => {
            setDialogOpen(open)
            if (!open) handleCloseDialog()
          }}>
            <DialogTrigger asChild>
              <Button size="sm">
                <Plus className="h-4 w-4 mr-2" />
                {lang === 'en' ? 'Add Task' : 'Agregar Tarea'}
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle className="text-2xl font-bold">
                  {editingTask
                    ? (lang === 'en' ? 'Edit Task' : 'Editar Tarea')
                    : (lang === 'en' ? 'Add New Task' : 'Agregar Nueva Tarea')}
                </DialogTitle>
                <DialogDescription>
                  {editingTask
                    ? (lang === 'en'
                        ? 'Update task information'
                        : 'Actualiza la información de la tarea')
                    : (lang === 'en'
                        ? 'Create a new task or feature for this project'
                        : 'Crea una nueva tarea o funcionalidad para este proyecto')}
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="title">
                    {lang === 'en' ? 'Title' : 'Título'} *
                  </Label>
                  <Input
                    id="title"
                    value={newTaskTitle}
                    onChange={(e) => setNewTaskTitle(e.target.value)}
                    className="!border-2 !border-border"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">
                    {lang === 'en' ? 'Description (optional)' : 'Descripción (opcional)'}
                  </Label>
                  <Textarea
                    id="description"
                    value={newTaskDescription}
                    onChange={(e) => setNewTaskDescription(e.target.value)}
                    rows={3}
                    className="!border-2 !border-border"
                  />
                </div>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="priority">
                      {lang === 'en' ? 'Priority' : 'Prioridad'}
                    </Label>
                    <Select value={newTaskPriority} onValueChange={(value) => setNewTaskPriority(value as TaskPriority)}>
                      <SelectTrigger id="priority" className="w-full !border-2 !border-border">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">{lang === 'en' ? 'Low' : 'Baja'}</SelectItem>
                        <SelectItem value="medium">{lang === 'en' ? 'Medium' : 'Media'}</SelectItem>
                        <SelectItem value="high">{lang === 'en' ? 'High' : 'Alta'}</SelectItem>
                        <SelectItem value="critical">{lang === 'en' ? 'Critical' : 'Crítica'}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="category">
                      {lang === 'en' ? 'Category (optional)' : 'Categoría (opcional)'}
                    </Label>
                    <Select value={newTaskCategory || undefined} onValueChange={(value) => setNewTaskCategory(value === 'none' ? '' : value)}>
                      <SelectTrigger id="category" className="w-full !border-2 !border-border">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">{lang === 'en' ? 'None' : 'Ninguna'}</SelectItem>
                        {predefinedCategories.map(category => (
                          <SelectItem key={category} value={category}>
                            {category}
                          </SelectItem>
                        ))}
                        {/* Agregar categorías existentes que no estén en la lista predefinida */}
                        {categories
                          .filter(cat => !predefinedCategories.includes(cat))
                          .map(category => (
                            <SelectItem key={category} value={category}>
                              {category}
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={handleCloseDialog}
                  disabled={isAddingTask}
                >
                  {lang === 'en' ? 'Cancel' : 'Cancelar'}
                </Button>
                <Button onClick={handleSaveTask} disabled={isAddingTask}>
                  {isAddingTask ? (
                    <>
                      {lang === 'en' ? (editingTask ? 'Saving...' : 'Adding...') : (editingTask ? 'Guardando...' : 'Agregando...')}
                    </>
                  ) : (
                    lang === 'en' ? (editingTask ? 'Update Task' : 'Add Task') : (editingTask ? 'Actualizar Tarea' : 'Agregar Tarea')
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

        {/* Filters */}
        {(categories.length > 0 || tasks.some(t => t.priority && t.priority !== 'medium')) && (
          <div className="flex gap-2 mb-4 flex-wrap">
            {categories.length > 0 && (
              <Select value={filterCategory} onValueChange={setFilterCategory}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder={lang === 'en' ? 'All categories' : 'Todas las categorías'} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{lang === 'en' ? 'All categories' : 'Todas las categorías'}</SelectItem>
                  {categories.map(cat => (
                    <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
            <Select value={filterPriority} onValueChange={setFilterPriority}>
              <SelectTrigger className="w-[185px]">
                <SelectValue placeholder={lang === 'en' ? 'All priorities' : 'Todas las prioridades'} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{lang === 'en' ? 'All priorities' : 'Todas las prioridades'}</SelectItem>
                <SelectItem value="critical">{lang === 'en' ? 'Critical' : 'Crítica'}</SelectItem>
                <SelectItem value="high">{lang === 'en' ? 'High' : 'Alta'}</SelectItem>
                <SelectItem value="medium">{lang === 'en' ? 'Medium' : 'Media'}</SelectItem>
                <SelectItem value="low">{lang === 'en' ? 'Low' : 'Baja'}</SelectItem>
              </SelectContent>
            </Select>
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
        ) : filteredTasks.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-8">
            {lang === 'en'
              ? 'No tasks match the selected filters.'
              : 'No hay tareas que coincidan con los filtros seleccionados.'
            }
          </p>
        ) : (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={filteredTasks.map(t => t.id)}
              strategy={verticalListSortingStrategy}
            >
              <div className="space-y-3">
                {filteredTasks.map((task) => (
                  <SortableTask
                    key={task.id}
                    task={task}
                    lang={lang}
                    onToggle={handleToggleTask}
                    onDelete={handleDeleteTask}
                    onEdit={handleEditTask}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        )}
      </CardContent>
    </Card>
  )
}
