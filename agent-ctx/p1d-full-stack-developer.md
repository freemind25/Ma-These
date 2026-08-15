# Task p1d — full-stack-developer

## Task
Create Feuille de Route Agile module

## Work Log
- Created `src/modules/feuille-route-agile/feuille-route-agile-page.tsx`
- Kanban board with 4 columns: À faire, En cours, En revue, Terminé
- Sprint CRUD via existing API routes (GET/POST /api/sprints, GET/PUT/DELETE /api/sprints/[id])
- Story CRUD via existing API routes (POST /api/sprints/[id]/stories, PUT/DELETE /api/stories/[id])
- Story cards with priority badge, phase badge, story points
- Click-to-move stories between columns (ChevronLeft/ChevronRight buttons)
- Sprint progress bar showing completion percentage
- Statistics panel with total stories, completed, in progress, average points
- Priority breakdown with per-priority progress bars
- Phase tracking showing which thesis phase (Cadrage, Revue, Rédaction, Révision, Finalisation) the sprint belongs to
- AI suggestion: "Générer le prochain sprint" button calls POST /api/ai-writing with sprint_planning mode
- Two tabs: Tableau Kanban + Statistiques
- Create Sprint Dialog (title, phase, description)
- Create Story Dialog (title, description, priority, story points)
- Sprint selector with phase and status badges
- Empty state when no sprints exist
- All UI text in French, no blue/indigo colors

## Notes
- The DB schema has 3 story statuses (todo, in_progress, done) but the UI shows 4 columns. The "En revue" column is tracked client-side via `storyColumnMap` state, and mapped to `in_progress` when persisting to the API.
- The AgileStory model does not have a `chapterId` field, so chapter assignment is not implemented (not in schema). Phase tracking is done via the parent sprint's phase field.
- Named export: `export function FeuilleRouteAgilePage()`
- Uses shadcn/ui: Card, Badge, Button, Dialog, Select, Input, Textarea, Progress, Separator, Tabs, Label, Skeleton
