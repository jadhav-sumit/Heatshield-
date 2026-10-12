import React, { useState } from 'react';
import { 
  CalendarCheck2, 
  Clock, 
  Droplets, 
  RefreshCcw, 
  ShieldCheck, 
  CheckCircle2, 
  AlertCircle, 
  UserCheck, 
  FileEdit, 
  Plus, 
  Check, 
  Info,
  Users
} from 'lucide-react';
import { DutyPlan, TaskItem } from '../types';
import { getRiskColorClasses } from '../utils/heatRisk';

interface DutyPlannerViewProps {
  dutyPlans: DutyPlan[];
  onUpdateDutyPlan: (updated: DutyPlan) => void;
  locationName: string;
}

export const DutyPlannerView: React.FC<DutyPlannerViewProps> = ({
  dutyPlans,
  onUpdateDutyPlan,
  locationName,
}) => {
  const [selectedPlanId, setSelectedPlanId] = useState<string>(dutyPlans[0]?.id || '');
  const [editingNotes, setEditingNotes] = useState(false);
  const [notesText, setNotesText] = useState('');
  const [newTaskText, setNewTaskText] = useState('');

  const activePlan = dutyPlans.find((p) => p.id === selectedPlanId) || dutyPlans[0];

  React.useEffect(() => {
    if (activePlan) {
      setNotesText(activePlan.supervisorNotes || '');
    }
  }, [activePlan?.id]);

  const handleToggleTask = (taskId: string) => {
    if (!activePlan) return;
    const updatedTasks: TaskItem[] = activePlan.tasks.map((t) =>
      t.id === taskId ? { ...t, completed: !t.completed } : t
    );
    const updatedPlan: DutyPlan = {
      ...activePlan,
      tasks: updatedTasks,
    };
    onUpdateDutyPlan(updatedPlan);
  };

  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskText.trim() || !activePlan) return;

    const newTask: TaskItem = {
      id: `task-${Date.now()}`,
      text: newTaskText.trim(),
      completed: false,
      category: 'checkin',
    };

    const updatedPlan: DutyPlan = {
      ...activePlan,
      tasks: [...activePlan.tasks, newTask],
    };
    onUpdateDutyPlan(updatedPlan);
    setNewTaskText('');
  };

  const handleSaveNotes = () => {
    if (!activePlan) return;
    const updatedPlan: DutyPlan = {
      ...activePlan,
      supervisorNotes: notesText,
    };
    onUpdateDutyPlan(updatedPlan);
    setEditingNotes(false);
  };

  const handleChangeSupervisorStatus = (newStatus: 'Approved' | 'Pending Review' | 'Action Required') => {
    if (!activePlan) return;
    const updatedPlan: DutyPlan = {
      ...activePlan,
      supervisorStatus: newStatus,
    };
    onUpdateDutyPlan(updatedPlan);
  };

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-stone-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-stone-900">
              Smart Duty Planner & Shift Optimizer
            </h1>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-semibold border border-emerald-200">
              {locationName} Roster
            </span>
          </div>
          <p className="text-xs text-stone-500 mt-1">
            Dynamic shift rotation, shaded rest intervals, and mandatory hydration guidance based on junction heat risks.
          </p>
        </div>
      </div>

      {/* Official Occupational Disclaimer */}
      <div className="bg-amber-50/80 border border-amber-200 p-4 rounded-xl text-xs text-amber-900 flex items-start gap-3">
        <Info className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
        <div>
          <span className="font-bold">Occupational Safety Guidance Disclaimer: </span>
          All duty schedules, rotation intervals, and hydration metrics are algorithmic suggestions. Duty rosters must strictly follow municipal department regulations, on-duty ACP/Superintendent decisions, and local labor safety guidelines.
        </div>
      </div>

      {/* Main Shift Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left 4 Cols: Roster Selector */}
        <div className="lg:col-span-4 space-y-3">
          <span className="text-xs font-bold text-stone-700 block uppercase tracking-wider">
            Active Shifts & Posts:
          </span>

          <div className="space-y-2.5">
            {dutyPlans.map((dp) => {
              const isSelected = dp.id === activePlan?.id;
              const completedCount = dp.tasks.filter((t) => t.completed).length;
              const totalCount = dp.tasks.length;

              return (
                <div
                  key={dp.id}
                  onClick={() => setSelectedPlanId(dp.id)}
                  className={`p-4 rounded-2xl border transition cursor-pointer shadow-xs ${
                    isSelected
                      ? 'bg-emerald-50/40 border-emerald-600 ring-2 ring-emerald-600/20'
                      : 'bg-white border-stone-200 hover:border-emerald-400 hover:bg-stone-50/50'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${getRiskColorClasses(dp.riskCategory).badge}`}>
                        {dp.riskCategory} Heat Exposure
                      </span>
                      <h3 className="font-bold text-sm text-stone-900 mt-1">{dp.shiftName}</h3>
                      <p className="text-xs text-stone-500">{dp.junctionName}</p>
                    </div>

                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      dp.supervisorStatus === 'Approved' ? 'bg-emerald-100 text-emerald-800' :
                      dp.supervisorStatus === 'Action Required' ? 'bg-red-100 text-red-800' :
                      'bg-amber-100 text-amber-800'
                    }`}>
                      {dp.supervisorStatus}
                    </span>
                  </div>

                  <div className="mt-3 pt-2.5 border-t border-stone-100 flex items-center justify-between text-xs text-stone-600">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-stone-400" />
                      {dp.shiftHours}
                    </span>
                    <span>
                      Tasks: <strong>{completedCount}/{totalCount}</strong>
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right 8 Cols: Detailed Duty Execution & Checklist */}
        <div className="lg:col-span-8 space-y-5">
          {activePlan && (
            <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-xs space-y-6">
              {/* Shift Title and Status Selector */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-stone-100">
                <div>
                  <h2 className="text-lg font-extrabold text-stone-900">
                    {activePlan.shiftName}
                  </h2>
                  <p className="text-xs text-stone-500">
                    Target Post: <strong>{activePlan.junctionName}</strong> | Shift Window: <strong>{activePlan.shiftHours}</strong>
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-stone-600">Review Status:</span>
                  <select
                    value={activePlan.supervisorStatus}
                    onChange={(e) => handleChangeSupervisorStatus(e.target.value as any)}
                    className="text-xs font-bold px-2.5 py-1.5 rounded-lg border border-stone-300 bg-white text-stone-800 focus:ring-1 focus:ring-emerald-600"
                  >
                    <option value="Approved">Approved by ACP</option>
                    <option value="Pending Review">Pending Review</option>
                    <option value="Action Required">Action Required</option>
                  </select>
                </div>
              </div>

              {/* 3 Metric Cards: Hydration, Rest Breaks, Rotation */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="p-4 rounded-xl bg-blue-50/80 border border-blue-200 text-blue-950">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-blue-700 uppercase mb-1">
                    <Droplets className="w-4 h-4 text-blue-600" />
                    <span>Hydration Target</span>
                  </div>
                  <div className="text-2xl font-black">{activePlan.hydrationTargetMlPerHour} ml/hr</div>
                  <span className="text-[11px] text-blue-800">
                    Drink 250ml every 25 min with electrolytes
                  </span>
                </div>

                <div className="p-4 rounded-xl bg-amber-50/80 border border-amber-200 text-amber-950">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-amber-700 uppercase mb-1">
                    <Clock className="w-4 h-4 text-amber-600" />
                    <span>Rest Interval</span>
                  </div>
                  <div className="text-2xl font-black">{activePlan.restBreakIntervalMin} min</div>
                  <span className="text-[11px] text-amber-800">
                    Mandatory shaded booth recovery
                  </span>
                </div>

                <div className="p-4 rounded-xl bg-emerald-50/80 border border-emerald-200 text-emerald-950">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-700 uppercase mb-1">
                    <RefreshCcw className="w-4 h-4 text-emerald-600" />
                    <span>Rotation Cycle</span>
                  </div>
                  <div className="text-2xl font-black">{activePlan.rotationHours} hrs</div>
                  <span className="text-[11px] text-emerald-800">
                    Max consecutive sun exposure
                  </span>
                </div>
              </div>

              {/* Specific Safety Recommendations */}
              <div className="p-4 rounded-xl bg-stone-50 border border-stone-200 space-y-2">
                <span className="text-xs font-bold text-stone-800 block uppercase tracking-wider">
                  Automated Heat-Stress Recommendations for this Shift:
                </span>
                <ul className="space-y-1.5 text-xs text-stone-700">
                  {activePlan.recommendations.map((rec, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-700 mt-1.5 shrink-0" />
                      <span>{rec}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Interactive Task Checklist */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-stone-800 uppercase tracking-wider">
                    Officer & Shift Duty Checklist:
                  </span>
                  <span className="text-xs text-stone-500">
                    Check tasks as verified on site
                  </span>
                </div>

                <div className="space-y-2">
                  {activePlan.tasks.map((task) => (
                    <div
                      key={task.id}
                      onClick={() => handleToggleTask(task.id)}
                      className={`p-3 rounded-xl border flex items-center justify-between transition cursor-pointer text-xs ${
                        task.completed
                          ? 'bg-emerald-50/70 border-emerald-300 text-emerald-900 line-through decoration-emerald-600'
                          : 'bg-white border-stone-200 hover:bg-stone-50 text-stone-800'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-5 h-5 rounded-md border flex items-center justify-center transition ${
                          task.completed
                            ? 'bg-emerald-600 border-emerald-600 text-white'
                            : 'border-stone-300 bg-white'
                        }`}>
                          {task.completed && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                        </div>
                        <span className="font-medium">{task.text}</span>
                      </div>

                      <span className="text-[10px] uppercase font-semibold text-stone-400">
                        {task.category}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Add Custom Task Form */}
                <form onSubmit={handleAddTask} className="flex gap-2 pt-2">
                  <input
                    type="text"
                    value={newTaskText}
                    onChange={(e) => setNewTaskText(e.target.value)}
                    placeholder="Add custom duty requirement (e.g., Deliver ice packs to traffic chowki)..."
                    className="flex-1 px-3 py-2 text-xs rounded-xl border border-stone-200 bg-white focus:outline-hidden focus:ring-1 focus:ring-emerald-600 text-stone-900"
                  />
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-xl bg-stone-800 hover:bg-stone-900 text-white text-xs font-bold flex items-center gap-1.5 transition"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Task</span>
                  </button>
                </form>
              </div>

              {/* Supervisor Notes Editor */}
              <div className="pt-4 border-t border-stone-100 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-stone-800 uppercase tracking-wider">
                    Supervisor Log & Briefing Notes:
                  </span>
                  {!editingNotes ? (
                    <button
                      onClick={() => setEditingNotes(true)}
                      className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 flex items-center gap-1"
                    >
                      <FileEdit className="w-3.5 h-3.5" />
                      <span>Edit Notes</span>
                    </button>
                  ) : (
                    <button
                      onClick={handleSaveNotes}
                      className="text-xs font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>Save Notes</span>
                    </button>
                  )}
                </div>

                {editingNotes ? (
                  <textarea
                    rows={3}
                    value={notesText}
                    onChange={(e) => setNotesText(e.target.value)}
                    className="w-full p-3 text-xs rounded-xl border border-stone-300 bg-white focus:outline-hidden focus:ring-1 focus:ring-emerald-600 text-stone-900"
                  />
                ) : (
                  <p className="p-3 rounded-xl bg-stone-50 border border-stone-200 text-xs text-stone-600 italic">
                    {activePlan.supervisorNotes || 'No custom supervisor notes logged for this shift.'}
                  </p>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
