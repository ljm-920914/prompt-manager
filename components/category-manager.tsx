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
import { Plus, Trash2, Palette, Check, X, Edit2 } from "lucide-react"
import { toast } from "sonner"
import type { Category } from "@/lib/storage"

interface CategoryManagerProps {
  categories: Category[]
  open: boolean
  onOpenChange: (open: boolean) => void
  onCreate: (category: Omit<Category, "id">) => void
  onUpdate: (id: string, updates: Partial<Category>) => void
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
  onUpdate,
  onDelete,
}: CategoryManagerProps) {
  const [newCategory, setNewCategory] = useState({
    name: "",
    description: "",
    color: PRESET_COLORS[0].color,
  })
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editName, setEditName] = useState("")
  const [editColor, setEditColor] = useState("")
  const [showColorPicker, setShowColorPicker] = useState<string | null>(null)

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

  const startEditing = (category: Category) => {
    setEditingId(category.id)
    setEditName(category.name)
    setEditColor(category.color)
    setShowColorPicker(null)
  }

  const saveEdit = (id: string) => {
    if (!editName.trim()) {
      toast.error("分类名称不能为空")
      return
    }
    onUpdate(id, { name: editName.trim(), color: editColor })
    setEditingId(null)
    setShowColorPicker(null)
    toast.success("分类已更新")
  }

  const cancelEdit = () => {
    setEditingId(null)
    setShowColorPicker(null)
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
                    {editingId === category.id ? (
                      // 编辑模式
                      <div className="flex-1 flex items-center gap-2">
                        <div className="relative">
                          <button 
                            onClick={() => setShowColorPicker(showColorPicker === category.id ? null : category.id)}
                            className="w-8 h-8 rounded-lg shrink-0 ring-2 ring-offset-1 ring-offset-background"
                            style={{ backgroundColor: editColor }}
                          />
                          {showColorPicker === category.id && (
                            <div className="absolute top-full mt-1 left-0 p-2 bg-background border border-border rounded-lg shadow-lg z-10 grid grid-cols-5 gap-1">
                              {PRESET_COLORS.map((c) => (
                                <button key={c.color}
                                  onClick={() => { setEditColor(c.color); setShowColorPicker(null); }}
                                  className="w-6 h-6 rounded-md hover:scale-110 transition-transform"
                                  style={{ backgroundColor: c.color }}
                                />
                              ))}
                            </div>
                          )}
                        </div>
                        <Input 
                          value={editName}
                          onChange={(e) => setEditName(e.target.value)}
                          className="flex-1 h-8 bg-background"
                          autoFocus
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') saveEdit(category.id)
                            if (e.key === 'Escape') cancelEdit()
                          }}
                        />
                      </div>
                    ) : (
                      // 显示模式
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: category.color }} />
                        <div className="min-w-0">
                          <p className="font-medium text-foreground truncate">{category.name}</p>
                          {category.description && (
                            <p className="text-xs text-muted-foreground truncate">{category.description}</p>
                          )}
                        </div>
                      </div>
                    )}
                    <div className="flex items-center gap-1 shrink-0">
                      {editingId === category.id ? (
                        <>
                          <Button variant="ghost" size="icon"
                            className="h-8 w-8 text-green-600 hover:text-green-700 hover:bg-green-50"
                            onClick={() => saveEdit(category.id)}>
                            <Check className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon"
                            className="h-8 w-8 text-muted-foreground hover:text-foreground"
                            onClick={cancelEdit}>
                            <X className="h-4 w-4" />
                          </Button>
                        </>
                      ) : (
                        <>
                          <Button variant="ghost" size="icon"
                            className="h-8 w-8 text-muted-foreground hover:text-primary hover:bg-primary/10"
                            onClick={() => startEditing(category)}>
                            <Edit2 className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon"
                            className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                            onClick={() => handleDelete(category.id, category.name)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </>
                      )}
                    </div>
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
