import { Equipment, MuscleGroup } from '../generated/prisma/enums';
import { prisma } from '../lib/prisma';
import { createHash } from 'node:crypto';

/* ------------------------------------------------------------------ */
/* TYPES                                                              */
/* ------------------------------------------------------------------ */
interface ExerciseSeed {
  slug: string;
  name: string;
  muscleGroup: MuscleGroup;
  equipment: Equipment;
  instructions: string;
}

interface PlanExerciseSeed {
  exerciseSlug: string;
  targetSets: number;
  targetReps: number;
  restSeconds: number;
}

interface PlanSeed {
  slug: string;
  name: string;
  description: string;
  exercises: PlanExerciseSeed[];
}

function deterministicUuid(slug: string): string {
  const hash = createHash('sha256').update(slug).digest('hex');
  return `${hash.slice(0, 8)}-${hash.slice(8, 12)}-4${hash.slice(13, 16)}-${hash.slice(16, 20)}-${hash.slice(20, 32)}`;
}

/* ------------------------------------------------------------------ */
/* EXERCISE CATALOG                                                   */
/* ------------------------------------------------------------------ */
const EXERCISES: ExerciseSeed[] = [
  /* ---------- CHEST ---------- */
  {
    slug: 'bench-press',
    name: 'Bench Press',
    muscleGroup: 'CHEST',
    equipment: 'BARBELL',
    instructions: 'Retract scapula, lower bar to mid-chest, press to lockout.',
  },
  {
    slug: 'incline-dumbbell-press',
    name: 'Incline Dumbbell Press',
    muscleGroup: 'CHEST',
    equipment: 'DUMBBELL',
    instructions: 'Set bench to 30-45°, press dumbbells overhead.',
  },
  {
    slug: 'cable-fly',
    name: 'Cable Fly',
    muscleGroup: 'CHEST',
    equipment: 'CABLE',
    instructions: 'Slight elbow bend, bring hands together at chest height.',
  },
  {
    slug: 'push-up',
    name: 'Push-up',
    muscleGroup: 'CHEST',
    equipment: 'BODYWEIGHT',
    instructions: 'Body straight, lower chest to floor, press up.',
  },
  {
    slug: 'dips',
    name: 'Dips',
    muscleGroup: 'CHEST',
    equipment: 'BODYWEIGHT',
    instructions:
      'Lean forward slightly, lower until upper arms parallel to floor.',
  },

  /* ---------- BACK ---------- */
  {
    slug: 'deadlift',
    name: 'Deadlift',
    muscleGroup: 'BACK',
    equipment: 'BARBELL',
    instructions: 'Bar over mid-foot, neutral spine, drive through floor.',
  },
  {
    slug: 'pull-up',
    name: 'Pull-up',
    muscleGroup: 'BACK',
    equipment: 'BODYWEIGHT',
    instructions: 'Overhand grip, pull chest to bar, control descent.',
  },
  {
    slug: 'barbell-row',
    name: 'Barbell Row',
    muscleGroup: 'BACK',
    equipment: 'BARBELL',
    instructions: 'Hinge at hips, pull bar to lower chest.',
  },
  {
    slug: 'lat-pulldown',
    name: 'Lat Pulldown',
    muscleGroup: 'BACK',
    equipment: 'CABLE',
    instructions: 'Pull bar to upper chest, squeeze lats, control return.',
  },
  {
    slug: 'seated-cable-row',
    name: 'Seated Cable Row',
    muscleGroup: 'BACK',
    equipment: 'CABLE',
    instructions: 'Pull handle to abdomen, squeeze shoulder blades.',
  },

  /* ---------- SHOULDERS ---------- */
  {
    slug: 'overhead-press',
    name: 'Overhead Press',
    muscleGroup: 'SHOULDERS',
    equipment: 'BARBELL',
    instructions: 'Brace core, press bar overhead to lockout.',
  },
  {
    slug: 'lateral-raise',
    name: 'Lateral Raise',
    muscleGroup: 'SHOULDERS',
    equipment: 'DUMBBELL',
    instructions: 'Raise arms to shoulder height, controlled descent.',
  },
  {
    slug: 'front-raise',
    name: 'Front Raise',
    muscleGroup: 'SHOULDERS',
    equipment: 'DUMBBELL',
    instructions: 'Raise dumbbells to shoulder height in front.',
  },
  {
    slug: 'rear-delt-fly',
    name: 'Rear Delt Fly',
    muscleGroup: 'SHOULDERS',
    equipment: 'DUMBBELL',
    instructions: 'Bent over, raise arms out to sides, squeeze rear delts.',
  },
  {
    slug: 'face-pull',
    name: 'Face Pull',
    muscleGroup: 'SHOULDERS',
    equipment: 'CABLE',
    instructions: 'Pull rope to forehead, elbows high.',
  },

  /* ---------- BICEPS ---------- */
  {
    slug: 'barbell-curl',
    name: 'Barbell Curl',
    muscleGroup: 'BICEPS',
    equipment: 'BARBELL',
    instructions: 'Elbows fixed, curl bar to chest, squeeze at top.',
  },
  {
    slug: 'hammer-curl',
    name: 'Hammer Curl',
    muscleGroup: 'BICEPS',
    equipment: 'DUMBBELL',
    instructions: 'Neutral grip, curl to shoulder height.',
  },
  {
    slug: 'preacher-curl',
    name: 'Preacher Curl',
    muscleGroup: 'BICEPS',
    equipment: 'BARBELL',
    instructions: 'Elbows on pad, curl bar up without swinging.',
  },
  {
    slug: 'incline-dumbbell-curl',
    name: 'Incline Dumbbell Curl',
    muscleGroup: 'BICEPS',
    equipment: 'DUMBBELL',
    instructions: 'On incline bench, full stretch at bottom, curl slowly.',
  },

  /* ---------- TRICEPS ---------- */
  {
    slug: 'triceps-pushdown',
    name: 'Triceps Pushdown',
    muscleGroup: 'TRICEPS',
    equipment: 'CABLE',
    instructions: 'Elbows pinned, extend to full lockout.',
  },
  {
    slug: 'skull-crusher',
    name: 'Skull Crusher',
    muscleGroup: 'TRICEPS',
    equipment: 'BARBELL',
    instructions: 'Lying, elbows fixed, lower bar to forehead, extend.',
  },
  {
    slug: 'overhead-triceps-extension',
    name: 'Overhead Triceps Extension',
    muscleGroup: 'TRICEPS',
    equipment: 'DUMBBELL',
    instructions: 'Elbows close to head, extend dumbbell overhead.',
  },
  {
    slug: 'close-grip-bench-press',
    name: 'Close-Grip Bench Press',
    muscleGroup: 'TRICEPS',
    equipment: 'BARBELL',
    instructions: 'Shoulder-width grip, press bar from chest, elbows tucked.',
  },
  {
    slug: 'diamond-push-up',
    name: 'Diamond Push-up',
    muscleGroup: 'TRICEPS',
    equipment: 'BODYWEIGHT',
    instructions: 'Hands together under chest, press up, elbows tight.',
  },

  /* ---------- LEGS ---------- */
  {
    slug: 'back-squat',
    name: 'Back Squat',
    muscleGroup: 'LEGS',
    equipment: 'BARBELL',
    instructions: 'Bar on traps, sit between hips to depth below parallel.',
  },
  {
    slug: 'romanian-deadlift',
    name: 'Romanian Deadlift',
    muscleGroup: 'LEGS',
    equipment: 'BARBELL',
    instructions: 'Hinge at hips, bar close to legs, feel hamstring stretch.',
  },
  {
    slug: 'leg-press',
    name: 'Leg Press',
    muscleGroup: 'LEGS',
    equipment: 'MACHINE',
    instructions: 'Controlled descent, do not lock knees at top.',
  },
  {
    slug: 'leg-extension',
    name: 'Leg Extension',
    muscleGroup: 'LEGS',
    equipment: 'MACHINE',
    instructions: 'Extend to lockout, squeeze quads, control descent.',
  },
  {
    slug: 'leg-curl',
    name: 'Leg Curl',
    muscleGroup: 'LEGS',
    equipment: 'MACHINE',
    instructions: 'Curl heels to glutes, controlled return.',
  },
  {
    slug: 'standing-calf-raise',
    name: 'Standing Calf Raise',
    muscleGroup: 'LEGS',
    equipment: 'MACHINE',
    instructions: 'Full stretch at bottom, rise to peak contraction.',
  },

  /* ---------- GLUTES ---------- */
  {
    slug: 'hip-thrust',
    name: 'Hip Thrust',
    muscleGroup: 'GLUTES',
    equipment: 'BARBELL',
    instructions: 'Upper back on bench, drive hips to full extension.',
  },
  {
    slug: 'bulgarian-split-squat',
    name: 'Bulgarian Split Squat',
    muscleGroup: 'GLUTES',
    equipment: 'DUMBBELL',
    instructions: 'Rear foot elevated, squat down on front leg.',
  },
  {
    slug: 'sumo-deadlift',
    name: 'Sumo Deadlift',
    muscleGroup: 'GLUTES',
    equipment: 'BARBELL',
    instructions: 'Wide stance, bar between legs, drive up with hips.',
  },
  {
    slug: 'cable-kickback',
    name: 'Cable Kickback',
    muscleGroup: 'GLUTES',
    equipment: 'CABLE',
    instructions: 'Ankle strap, extend leg back, squeeze glute at top.',
  },
  {
    slug: 'glute-bridge',
    name: 'Glute Bridge',
    muscleGroup: 'GLUTES',
    equipment: 'BODYWEIGHT',
    instructions: 'Lying on back, drive hips up, squeeze glutes at top.',
  },

  /* ---------- CORE ---------- */
  {
    slug: 'plank',
    name: 'Plank',
    muscleGroup: 'CORE',
    equipment: 'BODYWEIGHT',
    instructions:
      'Forearms on floor, body straight. Reps represent seconds held.',
  },
  {
    slug: 'hanging-leg-raise',
    name: 'Hanging Leg Raise',
    muscleGroup: 'CORE',
    equipment: 'BODYWEIGHT',
    instructions: 'Hang from bar, raise legs to hip height, controlled return.',
  },
  {
    slug: 'cable-crunch',
    name: 'Cable Crunch',
    muscleGroup: 'CORE',
    equipment: 'CABLE',
    instructions: 'Kneel, flex abs to bring elbows toward knees.',
  },
  {
    slug: 'russian-twist',
    name: 'Russian Twist',
    muscleGroup: 'CORE',
    equipment: 'BODYWEIGHT',
    instructions: 'Seated, rotate torso side to side with control.',
  },
  {
    slug: 'ab-wheel',
    name: 'Ab Wheel Rollout',
    muscleGroup: 'CORE',
    equipment: 'OTHER',
    instructions:
      'Roll out from knees, keep core tight, return without sagging.',
  },

  /* ---------- CARDIO ---------- */
  {
    slug: 'treadmill-run',
    name: 'Treadmill Run',
    muscleGroup: 'CARDIO',
    equipment: 'MACHINE',
    instructions: 'Steady-state run at moderate pace. Reps represent minutes.',
  },
  {
    slug: 'rowing-machine',
    name: 'Rowing Machine',
    muscleGroup: 'CARDIO',
    equipment: 'MACHINE',
    instructions: 'Drive legs, then torso, then arms. Reps represent minutes.',
  },
  {
    slug: 'jump-rope',
    name: 'Jump Rope',
    muscleGroup: 'CARDIO',
    equipment: 'OTHER',
    instructions: 'Continuous skipping, small hops. Reps represent seconds.',
  },
  {
    slug: 'cycling',
    name: 'Stationary Cycling',
    muscleGroup: 'CARDIO',
    equipment: 'MACHINE',
    instructions: 'Steady state on stationary bike. Reps represent minutes.',
  },
];

/* ------------------------------------------------------------------ */
/* WORKOUT PLANS                                                      */
/* One routine per muscle group + composites.                         */
/* For CORE/CARDIO: reps represent seconds or minutes per the         */
/* exercise instructions. This is documented in the plan description. */
/* ------------------------------------------------------------------ */
const PLANS: PlanSeed[] = [
  {
    slug: 'chest-day',
    name: 'Chest Day',
    description:
      'Full chest session: heavy compound + incline + isolation + bodyweight finisher.',
    exercises: [
      {
        exerciseSlug: 'bench-press',
        targetSets: 4,
        targetReps: 8,
        restSeconds: 120,
      },
      {
        exerciseSlug: 'incline-dumbbell-press',
        targetSets: 3,
        targetReps: 10,
        restSeconds: 90,
      },
      {
        exerciseSlug: 'cable-fly',
        targetSets: 3,
        targetReps: 12,
        restSeconds: 60,
      },
      { exerciseSlug: 'dips', targetSets: 3, targetReps: 10, restSeconds: 90 },
      {
        exerciseSlug: 'push-up',
        targetSets: 3,
        targetReps: 15,
        restSeconds: 60,
      },
    ],
  },
  {
    slug: 'back-day',
    name: 'Back Day',
    description: 'Heavy deadlifts, vertical pulling, horizontal pulling.',
    exercises: [
      {
        exerciseSlug: 'deadlift',
        targetSets: 3,
        targetReps: 5,
        restSeconds: 180,
      },
      {
        exerciseSlug: 'pull-up',
        targetSets: 4,
        targetReps: 8,
        restSeconds: 120,
      },
      {
        exerciseSlug: 'barbell-row',
        targetSets: 4,
        targetReps: 8,
        restSeconds: 120,
      },
      {
        exerciseSlug: 'lat-pulldown',
        targetSets: 3,
        targetReps: 10,
        restSeconds: 90,
      },
      {
        exerciseSlug: 'seated-cable-row',
        targetSets: 3,
        targetReps: 12,
        restSeconds: 90,
      },
    ],
  },
  {
    slug: 'shoulder-day',
    name: 'Shoulder Day',
    description:
      'Overhead press strength + deltoid isolation for all three heads.',
    exercises: [
      {
        exerciseSlug: 'overhead-press',
        targetSets: 4,
        targetReps: 8,
        restSeconds: 120,
      },
      {
        exerciseSlug: 'lateral-raise',
        targetSets: 4,
        targetReps: 12,
        restSeconds: 60,
      },
      {
        exerciseSlug: 'front-raise',
        targetSets: 3,
        targetReps: 12,
        restSeconds: 60,
      },
      {
        exerciseSlug: 'rear-delt-fly',
        targetSets: 3,
        targetReps: 12,
        restSeconds: 60,
      },
      {
        exerciseSlug: 'face-pull',
        targetSets: 3,
        targetReps: 15,
        restSeconds: 60,
      },
    ],
  },
  {
    slug: 'biceps-day',
    name: 'Biceps Day',
    description:
      'Full biceps session: heavy curls, hammer, preacher, incline stretch.',
    exercises: [
      {
        exerciseSlug: 'barbell-curl',
        targetSets: 3,
        targetReps: 10,
        restSeconds: 90,
      },
      {
        exerciseSlug: 'hammer-curl',
        targetSets: 3,
        targetReps: 12,
        restSeconds: 60,
      },
      {
        exerciseSlug: 'preacher-curl',
        targetSets: 3,
        targetReps: 10,
        restSeconds: 60,
      },
      {
        exerciseSlug: 'incline-dumbbell-curl',
        targetSets: 3,
        targetReps: 12,
        restSeconds: 60,
      },
    ],
  },
  {
    slug: 'triceps-day',
    name: 'Triceps Day',
    description:
      'All three triceps heads: pushdowns, overhead, skull crushers, close-grip, bodyweight.',
    exercises: [
      {
        exerciseSlug: 'triceps-pushdown',
        targetSets: 3,
        targetReps: 12,
        restSeconds: 60,
      },
      {
        exerciseSlug: 'skull-crusher',
        targetSets: 3,
        targetReps: 10,
        restSeconds: 90,
      },
      {
        exerciseSlug: 'overhead-triceps-extension',
        targetSets: 3,
        targetReps: 12,
        restSeconds: 60,
      },
      {
        exerciseSlug: 'close-grip-bench-press',
        targetSets: 3,
        targetReps: 10,
        restSeconds: 90,
      },
      {
        exerciseSlug: 'diamond-push-up',
        targetSets: 3,
        targetReps: 15,
        restSeconds: 60,
      },
    ],
  },
  {
    slug: 'leg-day',
    name: 'Leg Day',
    description:
      'Quads, hamstrings and calves. Heavy squats followed by accessory work.',
    exercises: [
      {
        exerciseSlug: 'back-squat',
        targetSets: 4,
        targetReps: 8,
        restSeconds: 180,
      },
      {
        exerciseSlug: 'romanian-deadlift',
        targetSets: 3,
        targetReps: 10,
        restSeconds: 120,
      },
      {
        exerciseSlug: 'leg-press',
        targetSets: 4,
        targetReps: 10,
        restSeconds: 120,
      },
      {
        exerciseSlug: 'leg-extension',
        targetSets: 3,
        targetReps: 12,
        restSeconds: 60,
      },
      {
        exerciseSlug: 'leg-curl',
        targetSets: 3,
        targetReps: 12,
        restSeconds: 60,
      },
      {
        exerciseSlug: 'standing-calf-raise',
        targetSets: 4,
        targetReps: 15,
        restSeconds: 60,
      },
    ],
  },
  {
    slug: 'glute-day',
    name: 'Glute Day',
    description:
      'Glute-focused session: thrusts, unilateral work, sumo pulls and isolation.',
    exercises: [
      {
        exerciseSlug: 'hip-thrust',
        targetSets: 4,
        targetReps: 10,
        restSeconds: 120,
      },
      {
        exerciseSlug: 'bulgarian-split-squat',
        targetSets: 3,
        targetReps: 10,
        restSeconds: 90,
      },
      {
        exerciseSlug: 'sumo-deadlift',
        targetSets: 3,
        targetReps: 8,
        restSeconds: 120,
      },
      {
        exerciseSlug: 'cable-kickback',
        targetSets: 3,
        targetReps: 15,
        restSeconds: 60,
      },
      {
        exerciseSlug: 'glute-bridge',
        targetSets: 3,
        targetReps: 15,
        restSeconds: 60,
      },
    ],
  },
  {
    slug: 'core-day',
    name: 'Core Day',
    description:
      'Core stability and anti-extension. Note: for Plank, "reps" represent seconds held.',
    exercises: [
      { exerciseSlug: 'plank', targetSets: 3, targetReps: 60, restSeconds: 45 },
      {
        exerciseSlug: 'hanging-leg-raise',
        targetSets: 3,
        targetReps: 12,
        restSeconds: 60,
      },
      {
        exerciseSlug: 'cable-crunch',
        targetSets: 3,
        targetReps: 15,
        restSeconds: 60,
      },
      {
        exerciseSlug: 'russian-twist',
        targetSets: 3,
        targetReps: 20,
        restSeconds: 45,
      },
      {
        exerciseSlug: 'ab-wheel',
        targetSets: 3,
        targetReps: 10,
        restSeconds: 60,
      },
    ],
  },
  {
    slug: 'cardio-day',
    name: 'Cardio Day',
    description:
      'Mixed cardio session. Note: for cardio exercises, "reps" represent minutes (or seconds for jump rope).',
    exercises: [
      {
        exerciseSlug: 'treadmill-run',
        targetSets: 1,
        targetReps: 20,
        restSeconds: 0,
      },
      {
        exerciseSlug: 'rowing-machine',
        targetSets: 1,
        targetReps: 15,
        restSeconds: 0,
      },
      {
        exerciseSlug: 'jump-rope',
        targetSets: 3,
        targetReps: 60,
        restSeconds: 30,
      },
      {
        exerciseSlug: 'cycling',
        targetSets: 1,
        targetReps: 20,
        restSeconds: 0,
      },
    ],
  },
  {
    slug: 'push-day',
    name: 'Push Day',
    description:
      'Chest, shoulders and triceps in one session. Upper-body compound focus.',
    exercises: [
      {
        exerciseSlug: 'bench-press',
        targetSets: 4,
        targetReps: 8,
        restSeconds: 120,
      },
      {
        exerciseSlug: 'incline-dumbbell-press',
        targetSets: 3,
        targetReps: 10,
        restSeconds: 90,
      },
      {
        exerciseSlug: 'overhead-press',
        targetSets: 3,
        targetReps: 8,
        restSeconds: 120,
      },
      {
        exerciseSlug: 'lateral-raise',
        targetSets: 3,
        targetReps: 15,
        restSeconds: 60,
      },
      {
        exerciseSlug: 'triceps-pushdown',
        targetSets: 3,
        targetReps: 12,
        restSeconds: 60,
      },
    ],
  },
  {
    slug: 'pull-day',
    name: 'Pull Day',
    description:
      'Back and biceps in one session. Heavy pulling plus rear delts and arm work.',
    exercises: [
      {
        exerciseSlug: 'deadlift',
        targetSets: 3,
        targetReps: 5,
        restSeconds: 180,
      },
      {
        exerciseSlug: 'pull-up',
        targetSets: 4,
        targetReps: 8,
        restSeconds: 120,
      },
      {
        exerciseSlug: 'barbell-row',
        targetSets: 3,
        targetReps: 10,
        restSeconds: 90,
      },
      {
        exerciseSlug: 'face-pull',
        targetSets: 3,
        targetReps: 15,
        restSeconds: 60,
      },
      {
        exerciseSlug: 'barbell-curl',
        targetSets: 3,
        targetReps: 10,
        restSeconds: 60,
      },
    ],
  },
  {
    slug: 'full-body-starter',
    name: 'Full Body Starter',
    description:
      'Balanced full-body routine for beginners. One compound per major movement pattern.',
    exercises: [
      {
        exerciseSlug: 'back-squat',
        targetSets: 3,
        targetReps: 8,
        restSeconds: 120,
      },
      {
        exerciseSlug: 'bench-press',
        targetSets: 3,
        targetReps: 8,
        restSeconds: 120,
      },
      {
        exerciseSlug: 'barbell-row',
        targetSets: 3,
        targetReps: 10,
        restSeconds: 90,
      },
      {
        exerciseSlug: 'overhead-press',
        targetSets: 3,
        targetReps: 10,
        restSeconds: 90,
      },
      {
        exerciseSlug: 'deadlift',
        targetSets: 3,
        targetReps: 5,
        restSeconds: 180,
      },
    ],
  },
];

/* ------------------------------------------------------------------ */
/* SEED LOGIC                                                         */
/* ------------------------------------------------------------------ */
async function seedExercises(): Promise<Map<string, string>> {
  const slugToId = new Map<string, string>();

  for (const ex of EXERCISES) {
    const id = deterministicUuid(`exercise:${ex.slug}`);
    await prisma.exercise.upsert({
      where: { id },
      create: {
        id,
        name: ex.name,
        muscleGroup: ex.muscleGroup,
        equipment: ex.equipment,
        instructions: ex.instructions,
      },
      update: {
        name: ex.name,
        muscleGroup: ex.muscleGroup,
        equipment: ex.equipment,
        instructions: ex.instructions,
      },
    });
    slugToId.set(ex.slug, id);
  }

  return slugToId;
}

async function seedPlan(
  plan: PlanSeed,
  exerciseIds: Map<string, string>,
): Promise<void> {
  const planId = deterministicUuid(`plan:${plan.slug}`);

  for (const pe of plan.exercises) {
    if (!exerciseIds.has(pe.exerciseSlug)) {
      throw new Error(
        `Plan "${plan.slug}" references unknown exercise slug "${pe.exerciseSlug}"`,
      );
    }
  }

  await prisma.$transaction(async (tx) => {
    // Upsert the plan header (global plan: createdByUserId = null)
    await tx.workoutPlan.upsert({
      where: { id: planId },
      create: {
        id: planId,
        name: plan.name,
        description: plan.description,
        createdByUserId: null,
      },
      update: {
        name: plan.name,
        description: plan.description,
      },
    });

    // Replace its exercises so re-running the seed keeps plans in sync
    await tx.planExercise.deleteMany({ where: { workoutPlanId: planId } });

    await tx.planExercise.createMany({
      data: plan.exercises.map((pe, idx) => ({
        workoutPlanId: planId,
        exerciseId: exerciseIds.get(pe.exerciseSlug)!,
        position: idx,
        targetSets: pe.targetSets,
        targetReps: pe.targetReps,
        restSeconds: pe.restSeconds,
      })),
    });
  });
}

async function main(): Promise<void> {
  console.log('🔧 Seeding exercises...');
  const exerciseIds = await seedExercises();
  console.log(`✅ ${EXERCISES.length} exercises ready\n`);

  console.log('🏋️  Seeding workout plans...');
  for (const plan of PLANS) {
    await seedPlan(plan, exerciseIds);
    console.log(`   • ${plan.name} (${plan.exercises.length} exercises)`);
  }
  console.log(`\n✅ ${PLANS.length} workout plans ready`);
}

main()
  .catch((err) => {
    console.error('❌ Seed failed:', err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
