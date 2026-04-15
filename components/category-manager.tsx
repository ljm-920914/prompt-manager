"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Plus, Trash2, Palette, Check } from "lucide-react"
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
  { color: "#8b5cf6", name: "紫色" },
  { color: "#3b82f6", name: "蓝色" },
  { color: "#10b981", name: "绿色" },
  { color: "#f59e0b", name: "橙色" },
  { color: "#ef4444", name: "红色" },
  { color: "#ec4899", name: "粉色" },
  { color: "#06b6d4", name: "青色" },
  { color: "#f97316", name: "橘色" },
  { color: "#6366f1", name: "靛蓝" },
  { color: "#84cc16", name: "柠檬" },
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
    color: PRESET_COLORS[0].color,
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
    setNewCategory({ name: "", description: "", color: PRESET_COLORS[0].color })
    toast.success("分类创建成功")
  }

  const handleDelete = (id: string, name: string) => {
    if (!confirm(`确定要删除分类 "${name}" 吗？该分类下的提示词将变为未分类。`)) return
    onDelete(id)
    toast.success("分类已删除")
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md p-0 gap-0">
        <DialogHeader className="p-6 pb-4 border-b border-border">
          <DialogTitle className="text-lg font-semibold text-foreground">管理分类</DialogTitle>
        </DialogHeader>

        <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
          {/* 新建 */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Plus className="h-4 w-4" />新建分类
            </h3>
            <div className="space-y-3">
              <div className="space-y-1.5">
                <Label className="text-sm text-muted-foreground">分类名称</Label>
                <Input placeholder="输入分类名称" value={newCategory.name}
                  onChange={(e) => setNewCategory((p) => ({ ...p, name: e.target.value }))}
                  className="bg-background" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-sm text-muted-foreground">描述（可选）</Label>
                <Input placeholder="分类描述" value={newCategory.description}
                  onChange={(e) => setNewCategory((p) => ({ ...p, description: e.target.value }))}
                  className="bg-background" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-sm text-muted-foreground flex items-center gap-2">
                  <Palette className="h-4 w-4" />选择颜色
                </Label>
                <div className="flex flex-wrap gap-2">
                  {PRESET_COLORS.map((preset) => (
                    <button key={preset.color}
                      onClick={() => setNewCategory((p) => ({ ...p, color: preset.color }))}
                      className={`w-8 h-8 rounded-lg transition-all ${newCategory.color === preset.color ? "ring-2 ring-primary ring-offset-2 ring-offset-background scale-110" : "hover:scale-105"}`}
                      style={{ backgroundColor: preset.color }} title={preset.name}>
                      {newCategory.color === preset.color && (
                        <Check className="h-4 w-4 text-white absolute inset-0 m-auto" />
                      )}
                    </button>
                  ))}
                </div>
              </div>
              <Button onClick={handleCreate} className="w-full">
                <Plus className="h-4 w-4 mr-2" />创建分类
              </Button>
            </div>
          </div>

          {/* 列表 */}
          <div className="space-y-3">
            <h3 className="text-sm font-medium text-muted-foreground">现有分类</h3>
            <div className="space-y-2">
              <AnimatePresence>
                {categories.map((category) => (
                  <motion.div key={category.id}
                    initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="flex items-center justify-between p-3 bg-muted/50 rounded-xl border border-border">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: category.color }} />
                      <div className="min-w-0">
                        <p className="font-medium text-foreground truncate">{category.name}</p>
                        {category.description && (
                          <p className="text-xs text-muted-foreground truncate">{category.description}</p>
                        )}
                      </div>
                    </div>
                    <Button variant="ghost" size="icon"
                      className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10 shrink-0"
                      onClick={() => handleDelete(category.id, category.name)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </motion.div>
                ))}
              </AnimatePresence>
              {categories.length === 0 && (
                <div className="text-center py-8 text-muted-foreground bg-muted/30 rounded-xl border border-dashed border-border">
                  <p className="text-sm">暂无分类</p>
                  <p className="text-xs mt-1">创建分类来整理你的提示词</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
