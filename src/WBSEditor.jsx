import { useState, useEffect } from "react";
import { database, ROOM_PASSWORD } from "./firebase";
import { ref, onValue, set } from "firebase/database";

// 生成唯一 ID
const genId = () => `wbs${Date.now()}${Math.random().toString(36).slice(2,6)}`;

// 密碼驗證組件
function PasswordModal({ onSuccess }) {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (password === ROOM_PASSWORD) {
      localStorage.setItem("wbs_auth", "true");
      onSuccess();
    } else {
      setError("密碼錯誤，請重試");
      setPassword("");
    }
  };

  return (
    <div style={{
      position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)",
      display: "flex", alignItems: "center", justifyContent: "center",
      fontFamily: "sans-serif"
    }}>
      <div style={{
        background: "#fff", padding: 32, borderRadius: 16,
        boxShadow: "0 8px 32px rgba(0,0,0,0.2)", maxWidth: 400, width: "90%"
      }}>
        <h2 style={{ margin: "0 0 8px 0", fontSize: 24, color: "#1e293b" }}>🔐 WBS Editor</h2>
        <p style={{ margin: "0 0 24px 0", color: "#64748b", fontSize: 14 }}>請輸入房間密碼以進入</p>
        <form onSubmit={handleSubmit}>
          <input
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            placeholder="輸入密碼..."
            autoFocus
            style={{
              width: "100%", padding: "12px 16px", borderRadius: 8,
              border: `2px solid ${error ? "#ef4444" : "#e2e8f0"}`,
              fontSize: 16, outline: "none", marginBottom: 12
            }}
          />
          {error && <p style={{ color: "#ef4444", fontSize: 13, margin: "0 0 12px 0" }}>{error}</p>}
          <button type="submit" style={{
            width: "100%", padding: "12px", borderRadius: 8, border: "none",
            background: "linear-gradient(135deg, #6366f1, #8b5cf6)", color: "#fff",
            fontSize: 16, fontWeight: 600, cursor: "pointer"
          }}>進入</button>
        </form>
      </div>
    </div>
  );
}

// WBS 節點組件
function WBSNode({ node, onUpdate, onDelete, onAddChild, level = 0 }) {
  const [collapsed, setCollapsed] = useState(false);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({
    name: node.name,
    assignee: node.assignee || "",
    hours: node.hours || "",
    startDate: node.startDate || "",
    endDate: node.endDate || ""
  });

  const hasChildren = node.children && node.children.length > 0;
  const indent = level * 24;

  const handleSave = () => {
    onUpdate(node.id, form);
    setEditing(false);
  };

  const handleCancel = () => {
    setForm({
      name: node.name,
      assignee: node.assignee || "",
      hours: node.hours || "",
      startDate: node.startDate || "",
      endDate: node.endDate || ""
    });
    setEditing(false);
  };

  return (
    <div style={{ marginBottom: 4 }}>
      {/* 節點主體 */}
      <div style={{
        display: "flex", alignItems: "center", gap: 8,
        padding: "8px 12px 8px " + (12 + indent) + "px",
        background: editing ? "#fef3c7" : level === 0 ? "#f0f9ff" : level === 1 ? "#f8fafc" : "#fff",
        borderRadius: 8,
        border: "1px solid " + (editing ? "#fbbf24" : level === 0 ? "#bae6fd" : "#e2e8f0"),
        transition: "all 0.15s"
      }}>
        {/* 展開/收合按鈕 */}
        {hasChildren && (
          <button
            onClick={() => setCollapsed(!collapsed)}
            style={{
              background: "none", border: "none", cursor: "pointer",
              fontSize: 12, padding: 4, color: "#64748b",
              transform: collapsed ? "rotate(-90deg)" : "rotate(0deg)",
              transition: "transform 0.2s"
            }}
          >
            ▼
          </button>
        )}

        {!hasChildren && <div style={{ width: 20 }} />}

        {/* 編輯模式 */}
        {editing ? (
          <div style={{ flex: 1, display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
            <input
              value={form.name}
              onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
              placeholder="項目名稱"
              style={{
                padding: "6px 10px", borderRadius: 6, border: "1px solid #e2e8f0",
                fontSize: 14, outline: "none", minWidth: 200, flex: "1 1 auto"
              }}
              autoFocus
            />
            <input
              value={form.assignee}
              onChange={e => setForm(f => ({ ...f, assignee: e.target.value }))}
              placeholder="負責人"
              style={{
                padding: "6px 10px", borderRadius: 6, border: "1px solid #e2e8f0",
                fontSize: 13, outline: "none", width: 100
              }}
            />
            <input
              type="number"
              value={form.hours}
              onChange={e => setForm(f => ({ ...f, hours: e.target.value }))}
              placeholder="工時"
              style={{
                padding: "6px 10px", borderRadius: 6, border: "1px solid #e2e8f0",
                fontSize: 13, outline: "none", width: 80
              }}
            />
            <input
              type="date"
              value={form.startDate}
              onChange={e => setForm(f => ({ ...f, startDate: e.target.value }))}
              style={{
                padding: "6px 10px", borderRadius: 6, border: "1px solid #e2e8f0",
                fontSize: 13, outline: "none", width: 140
              }}
            />
            <input
              type="date"
              value={form.endDate}
              onChange={e => setForm(f => ({ ...f, endDate: e.target.value }))}
              style={{
                padding: "6px 10px", borderRadius: 6, border: "1px solid #e2e8f0",
                fontSize: 13, outline: "none", width: 140
              }}
            />
            <button onClick={handleSave} style={{
              padding: "6px 12px", borderRadius: 6, border: "none",
              background: "#10b981", color: "#fff", fontSize: 13, cursor: "pointer", fontWeight: 600
            }}>✓ 儲存</button>
            <button onClick={handleCancel} style={{
              padding: "6px 12px", borderRadius: 6, border: "none",
              background: "#ef4444", color: "#fff", fontSize: 13, cursor: "pointer", fontWeight: 600
            }}>✕ 取消</button>
          </div>
        ) : (
          <>
            {/* 顯示模式 */}
            <div style={{ flex: 1, display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
              <span style={{ fontWeight: level === 0 ? 700 : 600, fontSize: level === 0 ? 16 : 14, color: "#1e293b" }}>
                {node.name}
              </span>
              {node.assignee && (
                <span style={{
                  padding: "2px 8px", borderRadius: 12, background: "#e0e7ff",
                  color: "#6366f1", fontSize: 12, fontWeight: 600
                }}>👤 {node.assignee}</span>
              )}
              {node.hours && (
                <span style={{
                  padding: "2px 8px", borderRadius: 12, background: "#dbeafe",
                  color: "#3b82f6", fontSize: 12, fontWeight: 600
                }}>⏱ {node.hours}h</span>
              )}
              {node.startDate && (
                <span style={{ fontSize: 12, color: "#64748b" }}>
                  📅 {node.startDate}
                </span>
              )}
              {node.endDate && (
                <span style={{ fontSize: 12, color: "#64748b" }}>
                  → {node.endDate}
                </span>
              )}
            </div>

            {/* 操作按鈕 */}
            <div style={{ display: "flex", gap: 4 }}>
              <button
                onClick={() => onAddChild(node.id)}
                style={{
                  padding: "4px 10px", borderRadius: 6, border: "none",
                  background: "#6366f1", color: "#fff", fontSize: 12,
                  cursor: "pointer", fontWeight: 600
                }}
              >+ 子項目</button>
              <button
                onClick={() => setEditing(true)}
                style={{
                  padding: "4px 10px", borderRadius: 6, border: "none",
                  background: "#f59e0b", color: "#fff", fontSize: 12,
                  cursor: "pointer", fontWeight: 600
                }}
              >✏️ 編輯</button>
              <button
                onClick={() => onDelete(node.id)}
                style={{
                  padding: "4px 10px", borderRadius: 6, border: "none",
                  background: "#ef4444", color: "#fff", fontSize: 12,
                  cursor: "pointer", fontWeight: 600
                }}
              >🗑️</button>
            </div>
          </>
        )}
      </div>

      {/* 子節點 */}
      {!collapsed && hasChildren && (
        <div style={{ marginTop: 4 }}>
          {node.children.map(child => (
            <WBSNode
              key={child.id}
              node={child}
              onUpdate={onUpdate}
              onDelete={onDelete}
              onAddChild={onAddChild}
              level={level + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default function WBSEditor() {
  const [wbs, setWbs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [projectName, setProjectName] = useState("專案名稱");
  const [editingProjectName, setEditingProjectName] = useState(false);

  // 檢查密碼驗證狀態
  useEffect(() => {
    const auth = localStorage.getItem("wbs_auth");
    if (auth === "true") {
      setIsAuthenticated(true);
    }
  }, []);

  // 從 Firebase 載入資料
  useEffect(() => {
    if (!isAuthenticated) return;

    const wbsRef = ref(database, 'wbs');
    const unsubscribe = onValue(wbsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        setWbs(data.items || []);
        setProjectName(data.projectName || "專案名稱");
      } else {
        // 初始化範例資料
        const initialData = {
          projectName: "我的專案",
          items: [
            {
              id: "wbs1",
              name: "階段一：需求分析",
              assignee: "Gary",
              hours: "40",
              startDate: "2026-03-01",
              endDate: "2026-03-10",
              children: [
                {
                  id: "wbs2",
                  name: "需求訪談",
                  assignee: "Alice",
                  hours: "16",
                  startDate: "2026-03-01",
                  endDate: "2026-03-05",
                  children: []
                },
                {
                  id: "wbs3",
                  name: "需求文件撰寫",
                  assignee: "Bob",
                  hours: "24",
                  startDate: "2026-03-06",
                  endDate: "2026-03-10",
                  children: []
                }
              ]
            }
          ]
        };
        set(wbsRef, initialData);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [isAuthenticated]);

  // 儲存到 Firebase
  const saveToFirebase = (items) => {
    const wbsRef = ref(database, 'wbs');
    set(wbsRef, { projectName, items });
  };

  // 遞迴更新節點
  const updateNodeById = (nodes, id, updates) => {
    return nodes.map(node => {
      if (node.id === id) {
        return { ...node, ...updates };
      }
      if (node.children && node.children.length > 0) {
        return { ...node, children: updateNodeById(node.children, id, updates) };
      }
      return node;
    });
  };

  // 遞迴刪除節點
  const deleteNodeById = (nodes, id) => {
    return nodes.filter(node => {
      if (node.id === id) return false;
      if (node.children && node.children.length > 0) {
        node.children = deleteNodeById(node.children, id);
      }
      return true;
    });
  };

  // 遞迴添加子節點
  const addChildById = (nodes, parentId, newNode) => {
    return nodes.map(node => {
      if (node.id === parentId) {
        return {
          ...node,
          children: [...(node.children || []), newNode]
        };
      }
      if (node.children && node.children.length > 0) {
        return { ...node, children: addChildById(node.children, parentId, newNode) };
      }
      return node;
    });
  };

  const handleUpdate = (id, updates) => {
    const updated = updateNodeById(wbs, id, updates);
    setWbs(updated);
    saveToFirebase(updated);
  };

  const handleDelete = (id) => {
    if (!confirm("確定刪除此項目及其所有子項目？")) return;
    const updated = deleteNodeById(wbs, id);
    setWbs(updated);
    saveToFirebase(updated);
  };

  const handleAddChild = (parentId) => {
    const newNode = {
      id: genId(),
      name: "新項目",
      assignee: "",
      hours: "",
      startDate: "",
      endDate: "",
      children: []
    };
    const updated = addChildById(wbs, parentId, newNode);
    setWbs(updated);
    saveToFirebase(updated);
  };

  const handleAddRoot = () => {
    const newNode = {
      id: genId(),
      name: "新階段",
      assignee: "",
      hours: "",
      startDate: "",
      endDate: "",
      children: []
    };
    const updated = [...wbs, newNode];
    setWbs(updated);
    saveToFirebase(updated);
  };

  const handleSaveProjectName = () => {
    const wbsRef = ref(database, 'wbs');
    set(wbsRef, { projectName, items: wbs });
    setEditingProjectName(false);
  };

  // 顯示密碼輸入介面
  if (!isAuthenticated) {
    return <PasswordModal onSuccess={() => setIsAuthenticated(true)} />;
  }

  if (loading) {
    return (
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "center",
        height: "100vh", fontFamily: "sans-serif", color: "#6366f1", fontSize: 18
      }}>
        載入中...
      </div>
    );
  }

  return (
    <div style={{ fontFamily: "sans-serif", minHeight: "100vh", background: "#f8fafc" }}>
      {/* 頁首 */}
      <div style={{
        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        color: "#fff", padding: "24px 0", boxShadow: "0 2px 8px rgba(0,0,0,0.1)"
      }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 16px" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div>
              {editingProjectName ? (
                <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                  <input
                    value={projectName}
                    onChange={e => setProjectName(e.target.value)}
                    style={{
                      padding: "8px 12px", borderRadius: 8, border: "none",
                      fontSize: 24, fontWeight: 700, outline: "none"
                    }}
                    autoFocus
                  />
                  <button onClick={handleSaveProjectName} style={{
                    padding: "8px 16px", borderRadius: 8, border: "none",
                    background: "#10b981", color: "#fff", fontSize: 14,
                    cursor: "pointer", fontWeight: 600
                  }}>✓ 儲存</button>
                  <button onClick={() => setEditingProjectName(false)} style={{
                    padding: "8px 16px", borderRadius: 8, border: "none",
                    background: "#ef4444", color: "#fff", fontSize: 14,
                    cursor: "pointer", fontWeight: 600
                  }}>✕ 取消</button>
                </div>
              ) : (
                <h1
                  onClick={() => setEditingProjectName(true)}
                  style={{
                    margin: 0, fontSize: 28, fontWeight: 700, cursor: "pointer",
                    display: "flex", alignItems: "center", gap: 8
                  }}
                >
                  📋 {projectName}
                  <span style={{ fontSize: 18, opacity: 0.7 }}>✏️</span>
                </h1>
              )}
              <p style={{ margin: "4px 0 0 0", opacity: 0.9, fontSize: 14 }}>
                Work Breakdown Structure - 工作分解結構
              </p>
            </div>
            <button onClick={handleAddRoot} style={{
              padding: "12px 24px", borderRadius: 10, border: "none",
              background: "#fff", color: "#667eea", fontSize: 16,
              cursor: "pointer", fontWeight: 700, boxShadow: "0 2px 8px rgba(0,0,0,0.1)"
            }}>+ 新增階段</button>
          </div>
        </div>
      </div>

      {/* WBS 內容 */}
      <div style={{ maxWidth: 1200, margin: "24px auto", padding: "0 16px" }}>
        {wbs.length === 0 ? (
          <div style={{
            textAlign: "center", padding: "60px 20px",
            background: "#fff", borderRadius: 16, border: "2px dashed #e2e8f0"
          }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>📋</div>
            <h3 style={{ margin: "0 0 8px 0", color: "#1e293b", fontSize: 20 }}>尚無項目</h3>
            <p style={{ color: "#64748b", margin: "0 0 24px 0" }}>點擊上方「+ 新增階段」開始建立你的 WBS</p>
            <button onClick={handleAddRoot} style={{
              padding: "12px 24px", borderRadius: 10, border: "none",
              background: "linear-gradient(135deg, #6366f1, #8b5cf6)", color: "#fff",
              fontSize: 16, cursor: "pointer", fontWeight: 600
            }}>+ 新增第一個階段</button>
          </div>
        ) : (
          <div style={{ background: "#fff", borderRadius: 16, padding: 20, boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}>
            {wbs.map(node => (
              <WBSNode
                key={node.id}
                node={node}
                onUpdate={handleUpdate}
                onDelete={handleDelete}
                onAddChild={handleAddChild}
                level={0}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
