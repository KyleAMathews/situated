import React from 'react'
import * as Y from 'yjs'
import { useYjs, useSubscribeYjs, useAwarenessStates } from 'situated'
import { useLocalStorage } from 'usehooks-ts'
import { nanoid } from 'nanoid'
import z from 'zod'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js'
import { Bar } from 'react-chartjs-2'

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend)

ChartJS.defaults.font.size = 20
export const chartOptions = {
  indexAxis: `x` as const,
  elements: {
    bar: {
      borderWidth: 2,
    },
  },
  responsive: true,
  plugins: {
    legend: {
      display: false,
      position: `right` as const,
      labels: {
        fontSize: 30,
      },
    },
    title: {
      display: false,
      text: `The internet's mood today`,
    },
  },
}

// MoodEvent
const MoodsEnum = z.enum([`🥺`, `😍`, `🤣`, `🤬`, `😓`])
type MoodsEnum = z.infer<typeof MoodsEnum>
const MoodEvent = z.object({
  id: z.string(),
  userId: z.string(),
  timestamp: z.string(),
  mood: MoodsEnum,
})

type MoodEvent = z.infer<typeof MoodEvent>

const labels = MoodsEnum.options

function App() {
  const { rootDoc } = useYjs()

  // get userId from localstorage
  const [userId, setUserId] = useLocalStorage(`userId`)
  if (!userId) {
    console.log(`no userId yet`)
    React.useEffect(() => {
      setUserId(nanoid())
    }, [])
  }

  // Get yjs array for mood events.
  const moodEventsYjs = rootDoc.getArray(`mood-events`)

  console.time(`process`)
  // Subscribe to updates.
  const moodEvents: Array<MoodEvent> = useSubscribeYjs(moodEventsYjs).sort(
    (a, b) => (a.timestamp > b.timestamp ? -1 : 1),
  )

  const recentMoods: Array<MoodEvent> = []
  let userMood: MoodsEnum = null
  // Get filtered list for charting the users current mood (if there is one).
  //
  // get
  console.log({ userId, moodEvents })

  const moodsCount = MoodsEnum.options.reduce((acc, cur) => {
    acc[cur] = 0
    return acc
  }, {})

  let total = 0
  console.log({ moodsCount })
  moodEvents.forEach((event) => {
    total += 1
    moodsCount[event.mood] += 1
    recentMoods.push(event)
    if (!userMood && event.userId == userId) {
      userMood = event.mood
    }
  })
  console.log({ moodsCount })

  const data = {
    labels: Object.keys(moodsCount),
    datasets: [
      {
        label: `moods`,
        data: Object.values(moodsCount),
        backgroundColor: [
          `rgba(255, 192, 203, 0.3)`,
          `rgba(255, 68, 68, 0.3)`,
          `rgba(255, 229, 100, 0.3)`,
          `rgba(0, 0, 0, 0.3)`,
          `rgba(0, 216, 255, 0.3)`,
        ],
        borderColor: [
          `rgb(255, 192, 203)`,
          `rgb(255, 68, 68)`,
          `rgb(255, 229, 100)`,
          `gb(0, 0, 0)`,
          `rgb(0, 216, 255)`,
        ],
      },
    ],
    options: {
      plugins: {
        legend: {
          labels: {
            // This more specific font property overrides the global property
            font: {
              size: 28,
            },
          },
        },
      },
    },
  }
  console.timeEnd(`process`)

  const usersOnline = useAwarenessStates((clients) => {
    return clients.size
  })

  return (
    <div className="container mx-auto p-3 max-w-4xl">
      <div className="flex flex-col flex-wrap justify-center">
        <h1 className="text-5xl font-bold text-center mb-6 mt-6 md:mt-12 lg:mt-16">
          What’s the internet’s mood today?
        </h1>
        <h2 className="text-2xl font-bold text-center mb-3 mt-3">Your mood?</h2>
        <div className="flex flex-row gap-3 text-5xl justify-center mb-8">
          {MoodsEnum.options.map((mood) => (
            <button
              key={mood}
              className={
                mood === userMood
                  ? `border-2 border-indigo-500`
                  : `border-2 border-indigo-50`
              }
              onClick={() => {
                const newEvent = MoodEvent.parse({
                  id: nanoid(),
                  userId,
                  timestamp: new Date().toJSON(),
                  mood,
                })
                moodEventsYjs.push([newEvent])
                console.log({ newEvent })
              }}
            >
              {mood}
            </button>
          ))}
        </div>
        <Bar options={chartOptions} data={data} />
        <div className="flex flex-col flex-wrap justify-center">
          <h2 className="text-2xl font-bold text-center mb-3 mt-3">
            Share your mood!
          </h2>
          <textarea
            style={{ margin: `0 auto`, display: `block` }}
            className="align-center w-72 h-72 border-dashed border-2 border-indigo-600 p-2"
            value={`My mood is ${userMood}!

The internet’s moods:
${Object.entries(moodsCount)
  .map(([mood, count]) => {
    console.log({ mood, count })
    return `${mood}: ${Math.round((count / total) * 100)}%`
  })
  .join(`\n`)}

How do you feel? Let everyone know at https://internet-moods.fly.dev`}
          />
        </div>
        <div>Users online: {usersOnline}</div>
      </div>
    </div>
  )
}

export default App
