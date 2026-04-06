"use client"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Plus, Trash2, Palette } from "lucide-react"
import { toast } from "sonner"
import type { Category } from "@/lib/storage"

interface CategoryManagerProps {
  categories: Category[]
  open: boolean
  onOpenChange: (open: boolean) => void
  onCreate: (category: Omit<Category, "id">) => void
  onDelete: (id: string) => void
}

const PRESET_COLORS = [
  "#8b5cf6", // violet
  "#3b82f6", // blue
  "#22c55e", // green
  "#f59e0b", // amber
  "#ef4444", // red
  "#ec4899", // pink
  "#06b6d4", // cyan
  "#f97316", // orange
  "#6366f1", // indigo
  "#84cc16", // lime
]

export function CategoryManager({
  categories,
  open,
  onOpenChange,
  onCreate,
  onDelete,
}: CategoryManagerProps) {
  const [newCategory, setNewCategory] = useState({
    name: "",
    description: "",
    color: PRESET_COLORS[0],
  })

  const handleCreate = () => {
    if (!newCategory.name.trim()) {
      toast.error("请输入分类名称")
      return
    }

    onCreate({
      name: newCategory.name,
      description: newCategory.description,
      color: newCategory.color,
      order: categories.length,
    })

    setNewCategory({
      name: "",
      description: "",
      color: PRESET_COLORS[0],
    })

    toast.success("分类创建成功")
  }

  const handleDelete = (id: string, name: string) => {
    if (!confirm(`确定要删除分类 "${name}" 吗？该分类下的提示词将变为未分类。`)) {
      return
    }
    onDelete(id)
    toast.success("分类已删除")
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>管理分类</DialogTitle>
        </DialogHeader>

        <div className="space-y-6 mt-4">
          {/* Create New Category */}
          <div className="space-y-4 p-4 bg-muted/50 rounded-xl">
            <h3 className="text-sm font-medium flex items-center gap-2">
              <Plus className="h-4 w-4" />
              新建分类
            </h3>

            <div className="space-y-2">
              <Label>分类名称</Label>
              <Input
                placeholder="输入分类名称"
                value={newCategory.name}
                onChange={(e) =>
                  setNewCategory((prev) => ({ ...prev, name: e.target.value }))
                }
              />
            </div>

            <div className="space-y-2">
              <Label>描述（可选）</Label>
              <Input
                placeholder="分类描述"
                value={newCategory.description}
                onChange={(e) =>
                  setNewCategory((prev) => ({ ...prev, description: e.target.value }))
                }
              />
            </div>

            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Palette className="h-4 w-4" />
                颜色
              </Label>
              <div className="flex flex-wrap gap-2">
                {PRESET_COLORS.map((color) => (
                  <button
                    key={color}
                    onClick={() => setNewCategory((prev) => ({ ...prev, color }))}
                    className={`w-8 h-8 rounded-lg transition-all ${
                      newCategory.color === color
                        ? "ring-2 ring-offset-2 ring-primary scale-110"
                        : "hover:scale-105"
                    }`}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            </div>

            <Button onClick={handleCreate} className="w-full">
              <Plus className="h-4 w-4 mr-2" />
              创建分类
            </Button>
          </div>

          {/* Category List */}
          <div className="space-y-2">
            <h3 className="text-sm font-medium">现有分类</h3>
            <ScrollArea className="h-[200px]">
              <div className="space-y-2">
                {categories.map((category) => (
                  <div
                    key={category.id}
                    className="flex items-center justify-between p-3 bg-muted rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: category.color }}
                      />
                      <div>
                        <p className="font-medium">{category.name}</p>
                        {category.description && (
                          <p className="text-xs text-muted-foreground">
                            {category.description}
                          </p>
                        )}
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-destructive"
                      onClick={() => handleDelete(category.id, category.name)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}

                {categories.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    <p className="text-sm">暂无分类</p>
                  </div>
                )}
              </div>
            </ScrollArea>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
