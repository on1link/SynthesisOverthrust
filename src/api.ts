// ============================================================
// NSynthesisOverthrust v0.1.0-alpha — src/api.ts
// Typed wrappers for ALL Tauri 2.0 IPC commands.
// Updated for 002_skill_cycle.sql:
//   - User: 'name' column, daily_xp_goal, timezone, onboarding_done
//   - SkillNode: canvas_x/canvas_y/prereqs/shared (001 columns)
//   - Levels: keyed "node_id::path_id", mastery-driven 0–5
//   - Tasks: node_id/subtopic_id (no skill_node_id)
//   - Goals: 'target' field (was 'total')
//   - New: subtopics, mastery, practice, resources,
//           focus, unlocks, milestones, notifications
// ============================================================

import { invoke } from "@tauri-apps/api/core";

// ════════════════════════════════════════════════════════════════════════════
// API OBJECT
// ════════════════════════════════════════════════════════════════════════════

export const api = {

  // ── User ──────────────────────────────────────────────────────────────────
  getUser: () => invoke<User>("get_user"),
  updateStreak: () => invoke<number>("update_streak"),

  // ── Skills — mastery-driven levels ───────────────────────────────────────
  getSkillLevels: () => invoke<SkillData>("get_skill_levels"),
  /** Spend 1 SP to boost all subtopics of node_id by +15 mastery. */
  levelUpSkill: (nodeId: string, pathId: string) => invoke<LevelUpResult>("level_up_skill", { nodeId, pathId }),

  // ── Subtopics ─────────────────────────────────────────────────────────────
  getSubtopics: (nodeId: string, pathId: string) => invoke<Subtopic[]>("get_subtopics", { nodeId, pathId }),
  updateSubtopicMastery: (subtopicId: string, pathId: string, delta: number) => invoke<MasteryUpdate>("update_subtopic_mastery", { subtopicId, pathId, delta }),

  // ── Practice problems ─────────────────────────────────────────────────────
  listPracticeProblems: (subtopicId: string, pathId: string, difficulty?: string, limit?: number) =>
    invoke<PracticeProblem[]>("list_practice_problems", { subtopicId, pathId, difficulty, limit }),
  submitPracticeAttempt: (a: PracticeAttemptArgs) =>
    invoke<PracticeAttemptResult>("submit_practice_attempt", {
      problemId: a.problem_id, subtopicId: a.subtopic_id, pathId: a.path_id,
      correct: a.correct, timeTakenS: a.time_taken_s, hintUsed: a.hint_used,
    }),

  // ── Learning resources ────────────────────────────────────────────────────
  listResources: (nodeId: string, pathId: string) => invoke<LearningResource[]>("list_resources", { nodeId, pathId }),
  updateResourceProgress: (resourceId: string, pctComplete: number) =>
    invoke<void>("update_resource_progress", { resourceId, pctComplete }),

  // ── Focus sessions ────────────────────────────────────────────────────────
  logFocusSession: (a: FocusSessionArgs) =>
    invoke<FocusResult>("log_focus_session", {
      durationMins: a.duration_mins, sessionType: a.session_type,
      nodeId: a.node_id, subtopicId: a.subtopic_id, pathId: a.path_id, notes: a.notes,
    }),

  // ── Node unlocks ──────────────────────────────────────────────────────────
  checkNodeUnlock: (nodeId: string, pathId: string) => invoke<UnlockResult>("check_node_unlock", { nodeId, pathId }),
  getUnlockedNodes: (pathId?: string) => invoke<NodeUnlock[]>("get_unlocked_nodes", { pathId }),

  // ── Milestones ────────────────────────────────────────────────────────────
  getMilestones: (pathId?: string) => invoke<Milestone[]>("get_milestones", { pathId }),

  // ── Notifications ─────────────────────────────────────────────────────────
  listNotifications: (unreadOnly?: boolean) => invoke<Notification[]>("list_notifications", { unreadOnly }),
  markNotificationRead: (id: string) => invoke<void>("mark_notification_read", { id }),
  markAllNotificationsRead: () => invoke<number>("mark_all_notifications_read"),

  // ── Tasks (002: node_id/subtopic_id) ──────────────────────────────────────
  listTasks: () => invoke<Task[]>("list_tasks"),
  createTask: (args: CreateTaskArgs) => invoke<{ id: string }>("create_task", { ...args } as Record<string, unknown>),
  completeTask: (taskId: string) => invoke<XpResult>("complete_task", { taskId }),
  deleteTask: (taskId: string) => invoke<void>("delete_task", { taskId }),

  // ── Goals (002: 'target' field) ───────────────────────────────────────────
  listGoals: () => invoke<Goal[]>("list_goals"),
  createGoal: (args: CreateGoalArgs) => invoke<{ id: string }>("create_goal", { ...args } as Record<string, unknown>),
  updateGoalProgress: (goalId: string, progress: number) => invoke<GoalProgress>("update_goal_progress", { goalId, progress }),

  // ── Grind (002: path_id/subtopic_id/difficulty) ───────────────────────────
  logGrindSession: (args: GrindArgs) => invoke<GrindResult>("log_grind_session", { ...args } as Record<string, unknown>),
  listGrindSessions: () => invoke<GrindSession[]>("list_grind_sessions"),

  // ── Projects ──────────────────────────────────────────────────────────────
  listProjects: () => invoke<Project[]>("list_projects"),
  createProject: (args: ProjectArgs) => invoke<{ id: string }>("create_project", { ...args } as Record<string, unknown>),
  moveProject: (projectId: string, status: string) => invoke<void>("move_project", { projectId, status }),
  deleteProject: (projectId: string) => invoke<void>("delete_project", { projectId }),

  // ── Vitals ────────────────────────────────────────────────────────────────
  logSleep: (args: SleepArgs) => invoke<SleepResult>("log_sleep", { ...args } as Record<string, unknown>),
  listSleepLogs: () => invoke<SleepLog[]>("list_sleep_logs"),
  listActivity: (limit?: number) => invoke<Activity[]>("list_activity", { limit }),

  // ── Vault / Config ────────────────────────────────────────────────────────
  setVaultPath: (path: string) => invoke<void>("set_vault_path", { path }),
  listVaultNotes: () => invoke<VaultNote[]>("list_vault_notes"),
  readVaultNote: (path: string) => invoke<string>("read_vault_note", { path }),
  writeVaultNote: (path: string, content: string) => invoke<void>("write_vault_note", { path, content }),
  getConfig: (key: string) => invoke<string | null>("get_config", { key }),
  setConfig: (key: string, value: string) => invoke<void>("set_config", { key, value }),


  // ── Assessments ─────────────────────────────────────────────────────────────
  //getAssessment: (node_id: string, path_id: string, level_target: number) =>
  //  invoke<Assessment>("get_assessment", { node_id, path_id, level_target }),

  //submitAssessment: (args: AssessmentAttemptArgs) =>
  //  invoke<AssessmentResult>("submit_assessment", args),

  //listAssessmentHistory: (node_id: string, path_id: string) =>
  // invoke<AssessmentAttempt[]>("list_assessment_history", { node_id, path_id }),

  // ── Phase 2 — Sidecar intelligence ───────────────────────────────────────
  srGetDue: (limit?: number) => invoke<SrCard[]>("sr_get_due", { limit }),
  srGetAll: () => invoke<SrCard[]>("sr_get_all"),
  srCreateCard: (itemId: number, front?: string, back?: string) => invoke<SrCard>("sr_create_card", { itemId, front, back }),
  srSubmitReview: (cardId: string, rating: number) => invoke<SrReviewResult>("sr_submit_review", { cardId, rating }),
  srGetStats: () => invoke<SrStats>("sr_get_stats"),
  srBackfill: () => invoke<{ created: number }>("sr_backfill"),

  // ── Skills catalog (LanceDB) ──────────────────────────────────────────────
  catalogIngest: () => invoke<{ ingested: number; skills: number }>("catalog_ingest"),
  catalogSearch: (query: string, k?: number, role?: string, tier?: string) =>
    invoke<CatalogHit[]>("catalog_search", { query, k, role, tier }),
  catalogStats: () => invoke<CatalogStats>("catalog_stats"),

  // ── Skill Scout ───────────────────────────────────────────────────────────
  scoutRun: (sources?: string[], limit?: number) => invoke<ScoutRunResult>("scout_run", { sources, limit }),
  scoutProposals: (status?: string) => invoke<ScoutProposal[]>("scout_proposals", { status }),
  scoutDecide: (proposalId: string, action: "approve" | "edit" | "reject", edits?: { skill?: string; topic?: string; tier?: string; roles?: string[] }) =>
    invoke<ScoutDecision>("scout_decide", { proposalId, action, ...edits }),
  scoutFewshot: () => invoke<ScoutFewshot[]>("scout_fewshot"),

  // searchVault: (query: string, top_k?: number) => invoke<SearchResult[]>("search_vault", { query, top_k }),
  // searchRelated: (skill_id: string) => invoke<SearchResult[]>("search_related", { skill_id }),
  // searchReindex: () => invoke<void>("search_reindex"),
  // searchStats: () => invoke<SearchStats>("search_stats"),

  // ── AI Tutor (Ollama, B8) — wire truth: python_sidecar/llm/router.py ──────
  llmChat: (messages: ChatMsg[], opts?: { model?: string; contextType?: "general" | "skill"; skillId?: string; sessionId?: string }) =>
    invoke<LlmChatResponse>("llm_chat", { messages, model: opts?.model, contextType: opts?.contextType, skillId: opts?.skillId, sessionId: opts?.sessionId }),
  llmPractice: (subtopicId: string, pathId: string, difficulty?: "easy" | "medium" | "hard", count?: number, model?: string) =>
    invoke<LlmPracticeResult>("llm_practice", { subtopicId, pathId, difficulty, count, model }),
  llmExplain: (concept: string, targetLevel?: "beginner" | "intermediate" | "expert", analogyDomain?: string, model?: string) =>
    invoke<LlmExplainResult>("llm_explain", { concept, targetLevel, analogyDomain, model }),
  llmListModels: () => invoke<LlmModels>("llm_list_models"),
  // llmIngestPaper — deferred to the vault slice (D12, B10/B14)

  analyticsOverview: () => invoke<AnalyticsOverview>("analytics_overview"),
  analyticsSkillVelocity: () => invoke<SkillVelocity[]>("analytics_skill_velocity"),
  analyticsSleepCorrelation: (_days?: number) => invoke<SleepCorrelation>("analytics_sleep_correlation"),
  analyticsSnapshot: () => invoke<{ week_start: string; xp_gained: number; snapshot: string }>("analytics_weekly_snapshot"),

  sidecarStatus: () => invoke<{ alive: boolean }>("sidecar_status"),
  sidecarRestart: () => invoke<void>("sidecar_restart"),

  // ── Phase 3 — Ecosystem ───────────────────────────────────────────────────
  // 




  backupCommit: (message?: string) => invoke<BackupResult>("backup_commit", { message }),
  //   backupPush: () => invoke<void>("backup_push"),
  //   backupSetRemote: (url: string) => invoke<void>("backup_set_remote", { url }),
  //   backupLog: () => invoke<BackupLog[]>("backup_log"),
  //   backupStatus: () => invoke<GitStatus>("backup_status"),
  //   backupSnapshotDb: () => invoke<{ snapshot: string }>("backup_snapshot_db"),
  // 
  //   syncStatus: () => invoke<SyncStatus>("sync_status"),
  //   syncWriteNote: (path: string, content: string, force?: boolean) => invoke<void>("sync_write_note", { path, content, force }),
  //   syncConflicts: () => invoke<SyncConflict[]>("sync_conflicts"),
  //   syncResolve: (note_path: string, resolution: string) => invoke<void>("sync_resolve", { note_path, resolution }),
  //   syncReindexVault: () => invoke<{ reindexed: number }>("sync_reindex_vault"),
  // 
  //   graphData: () => invoke<GraphData>("graph_data"),
  //   graphStats: () => invoke<GraphStats>("graph_stats"),
  //   graphNeighbours: (node_id: string, depth?: number) => invoke<GraphData>("graph_neighbours", { node_id, depth }),
  //   graphRebuild: () => invoke<void>("graph_rebuild"),
  //   graphFindPath: (src: string, dst: string) => invoke<{ path: string[] }>("graph_find_path", { src, dst }),
  // 
  //   collabListRooms: () => invoke<Room[]>("collab_list_rooms"),
  //   collabCreateRoom: (name: string, topic?: string, room_id?: string) => invoke<Room>("collab_create_room", { name, topic, room_id }),
  //   collabDeleteRoom: (room_id: string) => invoke<void>("collab_delete_room", { room_id }),
  //   collabRoomMessages: (room_id: string) => invoke<RoomMessage[]>("collab_room_messages", { room_id }),
  // 
  //   pluginsList: () => invoke<Plugin[]>("plugins_list"),
  //   pluginsToggle: (plugin_id: string, enabled: boolean) => invoke<void>("plugins_toggle", { plugin_id, enabled }),
  //   pluginsFireHook: (hook: string, payload?: object) => invoke<void>("plugins_fire_hook", { hook, payload }),
  //   pluginsGetConfig: (plugin_id: string) => invoke<object>("plugins_get_config", { plugin_id }),
  //   pluginsSetConfig: (plugin_id: string, config: object) => invoke<void>("plugins_set_config", { plugin_id, config }),
  //   pluginsEvents: () => invoke<PluginEvent[]>("plugins_events"),
  // 
  mobileGenerateKey: (label?: string) => invoke<{ key: string }>("mobile_generate_key", { label }),
  mobileListKeys: () => invoke<MobileKey[]>("mobile_list_keys"),
  mobileRevokeKey: (keyId: string) => invoke<void>("mobile_revoke_key", { keyId }),
  syntthingStatus: (apiKey?: string) => invoke<object>("syncthing_status", { apiKey }),
};


// ════════════════════════════════════════════════════════════════════════════
// TYPES
// ════════════════════════════════════════════════════════════════════════════

// ── User ──────────────────────────────────────────────────────────────────────
export interface User {
  id: string;
  name: string;
  xp: number;
  level: number;
  sp: number;
  streak: number;
  daily_xp_goal: number;
  timezone: string;
  onboarding_done: boolean;
}

// ── Skills ────────────────────────────────────────────────────────────────────
export interface SkillData {
  /** Key: "node_id::path_id" → mastery-driven level data */
  levels: Record<string, NodeLevel>;
  nodes: SkillNode[];
  roles: Role[];
  difficulties: Difficulty[];
}

export interface Role {
  id: string;
  name: string;
  color: string;
  bg_color: string;
  bg_alpha: string;
  sort_order: number;
}

export interface Difficulty {
  id: string;
  label: string;
  short_label: string;
  sort_order: number;
}

export interface SkillNode {
  id: string;
  path_id: string;       // role_id this node instance belongs to
  name: string;
  icon: string;
  description: string;
  difficulty_id: string;
  prereqs: string;        // JSON array of skill ids
  shared: string;         // JSON array of role ids
  topic_count: number;    // number of topics (= max level display)
  item_count: number;     // total checklist items
}

export interface NodeLevel {
  level: number;  // 0–5, computed from avg subtopic mastery
  avg_mastery: number;  // 0–100 average across subtopics
  mastered_subtopics: number;  // count with mastery >= 80
  xp_invested: number;
  unlocked: boolean;
}

// ── Subtopics ─────────────────────────────────────────────────────────────────
export interface Subtopic {
  id: string;
  node_id: string;
  path_id: string;
  name: string;
  description: string;
  order_idx: number;
  xp_value: number;
  mastery: number;   // 0–100
  practice_count: number;
  correct_count: number;
  accuracy: number;   // 0–100 percent
  last_practiced?: string;
}

export interface MasteryUpdate {
  subtopic_id: string;
  new_mastery: number;
  node_id?: string;
}

// ── Practice ──────────────────────────────────────────────────────────────────
export interface PracticeProblem {
  id: string;
  difficulty: "easy" | "medium" | "hard";
  problem_text: string;
  hints: string;    // JSON array
  explanation?: string;
}

export interface PracticeAttemptArgs {
  problem_id: string;
  subtopic_id: string;
  path_id: string;
  correct: boolean;
  time_taken_s: number;
  hint_used: boolean;
}

export interface PracticeAttemptResult {
  attempt_id: string;
  correct: boolean;
  mastery_delta: number;
  new_mastery: number;
  xp_result: XpResult;
}

// ── Level Up ──────────────────────────────────────────────────────────────────
export interface LevelUpResult {
  node_id: string;
  path_id: string;
  new_level: number;
  xp_result: XpResult;
}

// ── Resources ─────────────────────────────────────────────────────────────────
export interface LearningResource {
  id: string;
  type: "book" | "course" | "paper" | "video" | "blog" | "tool";
  title: string;
  url?: string;
  author?: string;
  est_hours: number;
  is_free: boolean;
  pct_complete: number;   // 0–100
  finished: boolean;
}

// ── Focus sessions ────────────────────────────────────────────────────────────
export interface FocusSessionArgs {
  duration_mins: number;
  session_type: "pomodoro" | "deep" | "review" | "assessment";
  node_id?: string;
  subtopic_id?: string;
  path_id?: string;
  notes?: string;
}

export interface FocusResult {
  session_id: string;
  xp_result: XpResult;
}

// ── Unlocks ───────────────────────────────────────────────────────────────────
export interface UnlockResult {
  unlocked: boolean;
  already_was: boolean;
  prereqs_needed?: string[];
}

export interface NodeUnlock {
  node_id: string;
  path_id: string;
}

// ── Milestones ────────────────────────────────────────────────────────────────
export type BadgeTier = "bronze" | "silver" | "gold" | "master" | "legend";

export interface Milestone {
  node_id: string;
  path_id: string;
  level: number;
  badge: BadgeTier;
  earned_at: string;
}

// ── Notifications ─────────────────────────────────────────────────────────────
export interface Notification {
  id: string;
  type: "sr_due" | "level_up" | "streak" | "goal" | "milestone" | "system";
  title: string;
  body?: string;
  read: boolean;
  created_at: string;
}

// ── Assessments ───────────────────────────────────────────────────────────────

export interface AssessmentOption {
  label: string; // e.g., "A", "B", "C", "D"
  text: string;
}

export interface AssessmentQuestion {
  id: string;
  subtopic_id?: string;
  question_text: string;
  options: AssessmentOption[];
  difficulty: "easy" | "medium" | "hard";
  order_idx: number;

  // Note: The Rust backend should ideally omit these two fields when sending the 
  // quiz to the frontend to prevent cheating, but they are needed for review mode.
  correct_index?: number;
  explanation?: string;
}

export interface Assessment {
  id: string;
  node_id: string;
  path_id: string;
  title: string;
  level_target: number;
  pass_score: number; // 0-100
  time_limit_s: number;
  question_count: number;
  questions: AssessmentQuestion[];
}

export interface AssessmentAnswer {
  question_id: string;
  chosen_index: number;
}

export interface AssessmentAttemptArgs {
  assessment_id: string;
  node_id: string;
  path_id: string;
  answers: AssessmentAnswer[];
  time_taken_s: number;
}

export interface AssessmentResult {
  attempt_id: string;
  score: number; // 0-100
  passed: boolean;
  xp_result: XpResult;
  new_level?: number; // Populated if this attempt unlocked the next node level
}

export interface AssessmentAttempt {
  id: string;
  assessment_id: string;
  node_id: string;
  path_id: string;
  score: number;
  passed: boolean;
  time_taken_s: number;
  xp_awarded: number;
  attempted_at: string;
}

// ── Tasks (002: node_id/subtopic_id) ──────────────────────────────────────────
export interface Task {
  id: string;
  title: string;
  description?: string;
  done: boolean;
  xp_reward: number;
  due_date?: string;
  node_id?: string;    // was skill_node_id in old commands
  subtopic_id?: string;
}

// ── Goals (002: 'total' in response maps from DB's 'target') ─────────────────
export interface Goal {
  id: string;
  title: string;
  description?: string;
  progress: number;
  total: number;   // DB column is 'target'; exposed as 'total' for frontend compat
  target_date?: string;
  done: boolean;
  pct: number;
}

export interface GoalProgress { progress: number; total: number; pct: number; done: boolean; }


// ── Grind (002: difficulty field) ─────────────────────────────────────────────
export interface GrindSession {
  id: string;
  platform: string;
  problems_solved: number;
  duration_mins: number;
  xp_reward: number;
  created_at: string;
  difficulty?: string;
}


export interface GrindResult { session_id: string; xp_result: XpResult; }

// ── XP / Project / Sleep / Activity / Vault ───────────────────────────────────
export interface XpResult { xp_gained: number; total_xp: number; new_level: number; leveled_up: boolean; sp_gained: number; total_sp: number; }
export interface Project { id: string; title: string; description?: string; status: string; xp_reward: number; repo_url?: string; }
export interface SleepLog { date: string; hours: number; quality: number; energy: number; notes?: string; }
export interface SleepResult { logged: boolean; date: string; xp_result: XpResult; }
export interface Activity { type: string; description?: string; xp: number; created_at: string; }
export interface VaultNote { path: string; title: string; word_count: number; modified_at: string; }

// ── SR (FSRS: rating 1=Again 2=Hard 3=Good 4=Easy) ───────────────────────────
export interface SrCard { id: string; user_id: string; item_id: number; front: string; back: string; skill_id?: string; skill_name?: string; topic_name?: string; stability?: number; difficulty?: number; fsrs_state: number; repetitions: number; lapses: number; interval_days: number; due_date: string; due_at: string; }
export interface SrStats { total_cards: number; due_today: number; total_reviews: number; avg_stability: number; avg_difficulty: number; retention: string; }
export interface SrReviewResult { card_id: string; rating: number; stability?: number; difficulty?: number; interval_days: number; due_at: string; due_date: string; again: boolean; mastery_delta: number; new_mastery: number; node_id?: string; node_level: number; }

// ── Catalog / Scout ───────────────────────────────────────────────────────────
export interface CatalogHit { id: string; skill: string; skill_slug: string; topic: string; subtopic: string; tier: string; roles: string[]; max_level?: number; prerequisites: string; score: number; }
export interface CatalogStats { ingested: boolean; subtopics: number; skills: number; by_tier?: Record<string, number>; }
export interface ScoutRunResult { candidates: number; proposed: number; skipped_covered: number; skipped_foreign: number; duplicates: number; }
export interface ScoutPlacement { skill: string; skill_slug?: string; topic: string; tier: string; roles: string[]; }
export interface ScoutNeighbor { skill: string; topic: string; subtopic: string; tier: string; score: number; }
export interface ScoutProposal { id: string; source: string; external_id: string; title: string; summary: string; url: string; proposed: ScoutPlacement; similarity: number; neighbors: ScoutNeighbor[]; status: string; created_at: string; }
export interface ScoutDecision { status: string; placement?: Record<string, unknown>; lance_id?: string; }
export interface ScoutFewshot { title: string; summary: string; proposed: { skill: string; topic: string; tier: string }; decision: string; final?: Record<string, unknown>; }

// ── Search / LLM / Analytics ──────────────────────────────────────────────────
export interface SearchResult { path: string; title: string; chunk: string; score: number; }
export interface SearchStats { indexed_chunks: number; last_built?: string; }
export interface ChatMsg { role: "user" | "assistant" | "system"; content: string; }
export interface LlmChatResponse { reply: string; session_id: string; model: string; }
export interface LlmPracticeResult { problems: PracticeProblem[]; count: number; model: string; }
export interface LlmExplainResult { explanation: string; concept: string; level: string; model: string; }
export interface LlmModels { models: string[]; error?: string; hint?: string; }
export interface AnalyticsOverview {
  user: { xp: number; level: number; sp: number; streak: number };
  week: { xp_gained: number; tasks_done: number; tasks_created: number; completion_rate: number; grind_sessions: number; grind_xp: number };
  sr: { due_today: number; avg_rating: number; retention: string };
  sleep: { avg_hours: number; avg_energy: number };
  xp_trend: { day: string; xp: number }[];
  top_skills: { node_id: string; name: string; level: number; avg_mastery?: number }[];
  platform_stats: { platform: string; sessions: number; xp: number }[];
}
export interface SkillVelocity { node_id: string; name: string; level: number; avg_mastery: number; xp_from_skill: number; sr_reviews: number; avg_rating: number; }
export interface SleepCorrelation { points: { date: string; hours: number; quality: number; energy: number; next_day_xp: number }[]; corr_hours_xp: number; corr_quality_xp: number; insight: string; }

// ── Phase 3 ───────────────────────────────────────────────────────────────────
export interface GraphData { nodes: GraphNode[]; links: GraphLink[]; }
export interface GraphNode { id: string; label: string; type: string; color: string; degree: number; }
export interface GraphLink { source: number; target: number; type: string; weight: number; }
export interface GraphStats { nodes: number; edges: number; density: number; components: number; }
export interface Room { room_id: string; name: string; topic: string; members: number; full: boolean; }
export interface RoomMessage { id: string; room_id: string; user_id: string; msg_type: string; content: string; created_at: string; }
export interface Plugin { id: string; name: string; version: string; enabled: boolean; hooks: string[]; }
export interface PluginEvent { plugin_id: string; hook: string; duration_ms: number; error?: string; fired_at: string; }
export interface MobileKey { id: string; label: string; last_used?: string; created_at: string; }
export interface BackupResult { status: string; message: string; commit_hash?: string; files_changed: number; }
export interface BackupLog { commit_hash?: string; message: string; date: string; }
export interface GitStatus { dirty: boolean; branch: string; has_remote: boolean; last_commit?: BackupLog; }
export interface SyncStatus { indexed_notes: number; pending_conflicts: number; last_backup?: string; }
export interface SyncConflict { id: string; note_path: string; local_hash: string; remote_hash: string; resolution: string; diff_preview?: string; }

// ── Arg types ─────────────────────────────────────────────────────────────────
export interface CreateTaskArgs { title: string; description?: string; xpReward?: number; dueDate?: string; nodeId?: string; subtopicId?: string; pathId?: string; }
export interface CreateGoalArgs { title: string; description?: string; goalType?: string; target: number; targetDate?: string; nodeId?: string; pathId?: string; }
export interface GrindArgs { platform: string; problemsSolved: number; durationMins: number; difficulty?: string; nodeId?: string; pathId?: string; subtopicId?: string; notes?: string; }
export interface ProjectArgs { title: string; description?: string; repoUrl?: string; }
export interface SleepArgs { hours: number; quality: number; energy: number; notes?: string; }
