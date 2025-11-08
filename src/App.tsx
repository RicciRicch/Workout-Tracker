import { useState, useEffect } from 'react'
import './App.css'

// Data models
type Set = {
  id: string;
  reps: number;
  weight: number;
};

type Exercise = {
  id: string;
  name: string;
  sets: Set[];
};

type Workout = {
  id: string;
  date: string;
  note: string;
  muscleGroups: string[];
  exercises: Exercise[];
};

// Main App
function App() {
  // State for all workouts
  const [workouts, setWorkouts] = useState<Workout[]>(() => {
    const data = localStorage.getItem('workouts');
    if (data) {
      try {
        return JSON.parse(data);
      } catch {
        return [];
      }
    }
    return [];
  });
  const [loadError, setLoadError] = useState<string>("");

  // State for new workout form
  const [date, setDate] = useState<string>("");
  const [note, setNote] = useState<string>("");
  const [muscleGroups, setMuscleGroups] = useState<string>(""); // comma separated

  // State for exercise form (per workout)
  const [exerciseName, setExerciseName] = useState<string>("");
  const [selectedWorkoutId, setSelectedWorkoutId] = useState<string>("");

  // State for statistics modal
  const [showStats, setShowStats] = useState(false);

  // Save workouts to localStorage on change
  useEffect(() => {
    localStorage.setItem('workouts', JSON.stringify(workouts));
    console.log('Upis u localStorage:', workouts);
    if (workouts.length > 0 && loadError) {
      setLoadError("");
    }
  }, [workouts]);

  // Add new workout
  function handleAddWorkout(e: React.FormEvent) {
    e.preventDefault();
    if (!date) return;
    const newWorkout: Workout = {
      id: Date.now().toString(),
      date,
      note,
      muscleGroups: muscleGroups.split(",").map(g => g.trim()).filter(Boolean),
      exercises: [],
    };
    setWorkouts(prev => [newWorkout, ...prev]);
    setDate("");
    setNote("");
    setMuscleGroups("");
  }

  // Add exercise to a workout
  function handleAddExercise(e: React.FormEvent) {
    e.preventDefault();
    if (!exerciseName || !selectedWorkoutId) return;
    setWorkouts(prev => prev.map(w => {
      if (w.id !== selectedWorkoutId) return w;
      const newExercise: Exercise = {
        id: Date.now().toString(),
        name: exerciseName,
        sets: [],
      };
      return { ...w, exercises: [...w.exercises, newExercise] };
    }));
    setExerciseName("");
  }

  // Add set to an exercise
  function handleAddSet(workoutId: string, exerciseId: string, reps: number, weight: number) {
    setWorkouts(prev => prev.map(w => {
      if (w.id !== workoutId) return w;
      return {
        ...w,
        exercises: w.exercises.map(ex => {
          if (ex.id !== exerciseId) return ex;
          const newSet: Set = {
            id: Date.now().toString(),
            reps,
            weight,
          };
          return { ...ex, sets: [...ex.sets, newSet] };
        })
      };
    }));
  }

  // Brisanje treninga
  function handleDeleteWorkout(id: string) {
    if (window.confirm('Da li sigurno želiš da obrišeš ceo trening?')) {
      setWorkouts(prev => prev.filter(w => w.id !== id));
    }
  }

  // Brisanje vežbe
  function handleDeleteExercise(workoutId: string, exerciseId: string) {
    setWorkouts(prev => prev.map(w =>
      w.id !== workoutId ? w : { ...w, exercises: w.exercises.filter(ex => ex.id !== exerciseId) }
    ));
  }

  // Brisanje seta
  function handleDeleteSet(workoutId: string, exerciseId: string, setId: string) {
    setWorkouts(prev => prev.map(w =>
      w.id !== workoutId ? w : {
        ...w,
        exercises: w.exercises.map(ex =>
          ex.id !== exerciseId ? ex : { ...ex, sets: ex.sets.filter(s => s.id !== setId) }
        )
      }
    ));
  }

  // Calculate stats
  function getMonthlyStats() {
    const stats: Record<string, { count: number; muscleGroups: Record<string, number> }> = {};
    workouts.forEach(w => {
      const month = w.date.slice(0, 7); // 'YYYY-MM'
      if (!stats[month]) stats[month] = { count: 0, muscleGroups: {} };
      stats[month].count++;
      w.muscleGroups.forEach(g => {
        if (!stats[month].muscleGroups[g]) stats[month].muscleGroups[g] = 0;
        stats[month].muscleGroups[g]++;
      });
    });
    return stats;
  }

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #232946 0%, #16161a 100%)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-start', padding: '24px 0' }}>
      <div style={{ width: '100%', maxWidth: 600, background: '#232946', borderRadius: 18, boxShadow: '0 4px 32px #0008', padding: '6vw 4vw', margin: '0 2vw', boxSizing: 'border-box', color: '#eaeaea' }}>
        <h1 style={{ textAlign: 'center', color: '#eebc7a', marginBottom: 32, letterSpacing: 1, fontWeight: 800, fontSize: 'clamp(1.7rem, 5vw, 2.2rem)' }}>🏋️‍♂️ Workout Tracker</h1>
        <button onClick={() => setShowStats(true)} style={{ display: 'block', margin: '0 auto 24px auto', background: 'linear-gradient(90deg, #eebc7a 60%, #232946 100%)', color: '#232946', border: 'none', borderRadius: 10, padding: '12px 32px', fontWeight: 700, fontSize: 16, cursor: 'pointer', boxShadow: '0 1px 8px #0004', letterSpacing: 1 }}>Prikaži statistiku</button>
        {showStats && (
          <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: '#232946cc', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ background: '#16161a', color: '#eaeaea', borderRadius: 16, padding: 32, minWidth: 280, maxWidth: '90vw', maxHeight: '80vh', overflowY: 'auto', boxShadow: '0 4px 32px #000a', position: 'relative' }}>
              <button onClick={() => setShowStats(false)} style={{ position: 'absolute', top: 12, right: 16, background: 'none', border: 'none', color: '#eebc7a', fontSize: 24, cursor: 'pointer', fontWeight: 700 }}>&times;</button>
              <h2 style={{ color: '#eebc7a', marginBottom: 18, textAlign: 'center' }}>Statistika po mesecima</h2>
              {Object.entries(getMonthlyStats()).length === 0 ? (
                <p style={{ color: '#b8b8b8', textAlign: 'center' }}>Nema podataka za statistiku.</p>
              ) : (
                <ul style={{ padding: 0, listStyle: 'none' }}>
                  {Object.entries(getMonthlyStats()).sort((a, b) => b[0].localeCompare(a[0])).map(([month, data]) => (
                    <li key={month} style={{ marginBottom: 18, borderBottom: '1px solid #393e46', paddingBottom: 10 }}>
                      <strong style={{ color: '#eebc7a', fontSize: 17 }}>{month}</strong>: {data.count} treninga
                      <ul style={{ marginTop: 6, paddingLeft: 16 }}>
                        {Object.entries(data.muscleGroups).map(([g, c]) => (
                          <li key={g} style={{ color: '#eaeaea', fontSize: 15 }}>{g}: {c} puta</li>
                        ))}
                      </ul>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        )}
        <form onSubmit={handleAddWorkout} style={{ margin: '0 auto 32px auto', display: 'flex', flexDirection: 'column', gap: 18, background: 'linear-gradient(90deg, #393e46 60%, #232946 100%)', borderRadius: 14, padding: '5vw 4vw', boxShadow: '0 2px 12px #0004', maxWidth: 420, minWidth: 0 }}>
          <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
            <label style={{ flex: '1 1 120px', minWidth: 120 }}>
              <span style={{ fontWeight: 600, color: '#eebc7a' }}>Datum</span><br />
              <input type="date" value={date} onChange={e => setDate(e.target.value)} required style={{ width: '100%', padding: 10, borderRadius: 8, border: '1px solid #393e46', background: '#16161a', color: '#eaeaea', fontWeight: 500, minWidth: 0 }} />
            </label>
            <label style={{ flex: '2 1 180px', minWidth: 180 }}>
              <span style={{ fontWeight: 600, color: '#eebc7a' }}>Grupe mišića</span><br />
              <input type="text" value={muscleGroups} onChange={e => setMuscleGroups(e.target.value)} placeholder="npr: grudi, triceps" style={{ width: '100%', padding: 10, borderRadius: 8, border: '1px solid #393e46', background: '#16161a', color: '#eaeaea', fontWeight: 500, minWidth: 0 }} />
            </label>
          </div>
          <label>
            <span style={{ fontWeight: 600, color: '#eebc7a' }}>Napomena</span><br />
            <input type="text" value={note} onChange={e => setNote(e.target.value)} placeholder="opciono" style={{ width: '100%', padding: 10, borderRadius: 8, border: '1px solid #393e46', background: '#16161a', color: '#eaeaea', fontWeight: 500 }} />
          </label>
          <button type="submit" style={{ background: 'linear-gradient(90deg, #eebc7a 60%, #232946 100%)', color: '#232946', border: 'none', borderRadius: 10, padding: '12px 0', fontWeight: 700, fontSize: 17, cursor: 'pointer', marginTop: 8, boxShadow: '0 1px 8px #0004', letterSpacing: 1 }}>Dodaj trening</button>
        </form>
        <p style={{ color: '#eebc7a', fontWeight: 600, marginBottom: 18, textAlign: 'center', fontSize: 'clamp(1rem, 2.5vw, 1.2rem)' }}>Broj treninga: {workouts.length}</p>
        <div style={{ color: '#ff6f61', fontWeight: 500, marginBottom: 16 }}>
          {/* Ako budeš želeo prikaz grešaka, ovde možeš dodati poruke */}
          {loadError && <span>{loadError}</span>}
        </div>
        {workouts.length === 0 && !loadError && (
          <p style={{ color: '#b8b8b8', textAlign: 'center', marginTop: 32 }}>Nema unetih treninga.</p>
        )}
        <ul style={{ padding: 0, listStyle: 'none' }}>
          {workouts.map(w => (
            <li key={w.id} style={{ border: '1px solid #393e46', background: 'linear-gradient(90deg, #232946 60%, #393e46 100%)', borderRadius: 14, marginBottom: 22, padding: '4vw 3vw', textAlign: 'left', boxShadow: '0 1px 8px #0004', minWidth: 0, color: '#eaeaea', position: 'relative' }}>
              {/* Dugme za brisanje treninga */}
              <button onClick={() => handleDeleteWorkout(w.id)} title="Obriši trening" style={{ position: 'absolute', top: 12, right: 14, background: 'none', border: 'none', color: '#ff6f61', fontSize: 22, cursor: 'pointer', padding: 0, lineHeight: 1 }}>🗑️</button>
              <div style={{ marginBottom: 8 }}>
                <div style={{ fontWeight: 700, color: '#eebc7a', fontSize: '1.08em', marginBottom: 2 }}>Datum</div>
                <div style={{ fontWeight: 600, fontSize: '1.15em', letterSpacing: 1 }}>{w.date}</div>
              </div>
              <div style={{ marginBottom: 8 }}>
                <div style={{ fontWeight: 700, color: '#eebc7a', fontSize: '1.08em', marginBottom: 2 }}>Grupe mišića</div>
                <div style={{ fontWeight: 600, fontSize: '1.08em', letterSpacing: 1, display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  {w.muscleGroups.map((g, i) => (
                    <span key={g + i} style={{ background: '#393e46', color: '#fff', borderRadius: 6, padding: '3px 10px', fontWeight: 700 }}>{g}</span>
                  ))}
                </div>
              </div>
              <em style={{ color: '#b8b8b8', fontSize: 'clamp(0.95rem, 2vw, 1.05rem)' }}>{w.note}</em>
              <div style={{ marginTop: 12 }}>
                <details style={{ background: 'none', border: 'none', padding: 0 }}>
                  <summary style={{ cursor: 'pointer', fontWeight: 600, color: '#eebc7a', fontSize: 'clamp(1rem, 2vw, 1.1rem)', marginBottom: 8 }}>Vežbe ({w.exercises.length})</summary>
                  <ul style={{ paddingLeft: 0, marginTop: 8 }}>
                    {w.exercises.map(ex => (
                      <li key={ex.id} style={{ marginBottom: 12, background: '#393e46', borderRadius: 8, padding: '2vw 2vw', minWidth: 0, color: '#eaeaea', position: 'relative' }}>
                        {/* Dugme za brisanje vežbe */}
                        <button onClick={() => handleDeleteExercise(w.id, ex.id)} title="Obriši vežbu" style={{ position: 'absolute', top: 10, right: 12, background: 'none', border: 'none', color: '#ff6f61', fontSize: 18, cursor: 'pointer', padding: 0, lineHeight: 1 }}>🗑️</button>
                        <strong style={{ color: '#eebc7a', fontSize: 'clamp(1rem, 2vw, 1.1rem)' }}>{ex.name}</strong>
                        <ul style={{ paddingLeft: 0, marginTop: 4 }}>
                          {ex.sets.map(s => (
                            <li key={s.id} style={{ color: '#eaeaea', fontSize: 'clamp(0.95rem, 2vw, 1.05rem)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
                              <span>{s.reps} ponavljanja × {s.weight} kg</span>
                              {/* Dugme za brisanje seta */}
                              <button onClick={() => handleDeleteSet(w.id, ex.id, s.id)} title="Obriši set" style={{ background: 'none', border: 'none', color: '#ff6f61', fontSize: 16, cursor: 'pointer', padding: 0, marginLeft: 8, lineHeight: 1 }}>🗑️</button>
                            </li>
                          ))}
                        </ul>
                        <form onSubmit={e => {
                          e.preventDefault();
                          const form = e.target as HTMLFormElement;
                          const repsInput = form.elements.namedItem('reps') as HTMLInputElement;
                          const weightInput = form.elements.namedItem('weight') as HTMLInputElement;
                          const repsVal = parseInt(repsInput.value, 10);
                          const weightVal = parseFloat(weightInput.value);
                          if (!isNaN(repsVal) && !isNaN(weightVal)) {
                            handleAddSet(w.id, ex.id, repsVal, weightVal);
                            repsInput.value = '';
                            weightInput.value = '';
                          }
                        }} style={{ display: 'flex', gap: 8, marginTop: 8, flexWrap: 'wrap' }}>
                          <input name="reps" type="number" min={1} placeholder="ponavljanja" style={{ width: 90, padding: 6, borderRadius: 6, border: '1px solid #232946', background: '#16161a', color: '#eaeaea', fontWeight: 500, flex: '1 1 70px', minWidth: 70 }} required />
                          <input name="weight" type="number" min={0} step={0.5} placeholder="kg" style={{ width: 90, padding: 6, borderRadius: 6, border: '1px solid #232946', background: '#16161a', color: '#eaeaea', fontWeight: 500, flex: '1 1 70px', minWidth: 70 }} required />
                          <button type="submit" style={{ background: '#eebc7a', color: '#232946', border: 'none', borderRadius: 6, padding: '6px 12px', fontWeight: 600, cursor: 'pointer', flex: '1 1 90px', minWidth: 90 }}>Dodaj set</button>
                        </form>
                      </li>
                    ))}
                  </ul>
                  <form onSubmit={e => {
                    setSelectedWorkoutId(w.id);
                    handleAddExercise(e);
                  }} style={{ display: 'flex', gap: 8, marginTop: 12, flexWrap: 'wrap' }}>
                    <input type="text" value={selectedWorkoutId === w.id ? exerciseName : ''} onChange={e => {
                      setSelectedWorkoutId(w.id);
                      setExerciseName(e.target.value);
                    }} placeholder="Nova vežba" required style={{ flex: '1 1 120px', padding: 8, borderRadius: 6, border: '1px solid #232946', background: '#16161a', color: '#eaeaea', fontWeight: 500, minWidth: 120 }} />
                    <button type="submit" style={{ background: 'linear-gradient(90deg, #eebc7a 60%, #232946 100%)', color: '#232946', border: 'none', borderRadius: 6, padding: '8px 16px', fontWeight: 700, cursor: 'pointer', flex: '1 1 90px', minWidth: 90 }}>Dodaj vežbu</button>
                  </form>
                </details>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default App
