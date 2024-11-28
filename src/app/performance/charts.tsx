"use client"

import { TrendingUp } from "lucide-react"
import { Bar, BarChart, LabelList, XAxis, YAxis } from "recharts"

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "~/components/ui/card"
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "~/components/ui/chart"

const chartConfig = {
  desktop: {
    label: "Desktop",
    color: "hsl(var(--chart-1))",
  },
} satisfies ChartConfig

type ChartData = {
  pegawai: string,
  total: number,
}

export default function Chart({
  data,
  title
}: {
  data: ChartData[]
  title: string
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{Intl.DateTimeFormat('id-ID').format(Date.now())}</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="  h-40 w-full">
          <BarChart
            accessibilityLayer
            data={data}
            layout="vertical"
            margin={{
              left: -10,
              right: 10,
            }}
          >
            <XAxis type="number" dataKey="total" hide />
            <YAxis
              dataKey="pegawai"
              type="category"
              tickLine={false}
              tickMargin={10}
              axisLine={false}
              height={2}
            />
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent hideLabel />}
            />
            <Bar dataKey="total" fill="var(--color-desktop)" radius={5} >
              <LabelList
                dataKey="total"
                position="right"
                offset={8}
                className="fill-foreground"
                fontSize={12}
                
              />
            </Bar>
       

          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
