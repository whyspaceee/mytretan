import { Grinding, type GrindingWithSlug } from "~/app/grinding/grinding";
import { ManualBatch, type ManualBatchWithSlug } from "~/app/manual/manual"
import { db } from "~/server/db";


export async function getBatchDataWithSlug(): Promise<ManualBatchWithSlug[]> {
  const data = await db.query.manualBatch.findMany({
    // where:  eq(manualBatch.status, "pending"),
    with: {
      manualBatchProducts: true
    },
    orderBy: (manualBatch, { desc }) => [desc(manualBatch.createdAt)]
  });

  return data
}


export async function getGrindingDataWithSlug(): Promise<GrindingWithSlug[]> {
  const data = await db.query.grinding.findMany({
    with: {
      manualBatch: {
        with: {
          manualBatchProducts: true
        }
      }
    },
    orderBy: (grinding, { desc }) => [desc(grinding.createdAt)]
  });

  return data
}

// export async function generateGrindingSlugs(grinding: Grinding[]): Promise<GrindingWithSlug[]> {

//   const allDates = [...new Set(grinding.map((e) => e.createdAt.toDateString()))]
//   const slugs = await getBatchDataWithSlug()

//   return allDates.map((date) =>
//     grinding.filter((e) => e.createdAt.toDateString() == date)
//   ).map((grindingBatch) =>
//     grindingBatch.map((e, index) => {
//       const batchWithSlug = slugs.filter((slug) => slug.grindingId == e.grindingId) 
//       return {
//         ...e,
//         manualBatch: batchWithSlug,
//         slug: `FP${index + 1}-${e.createdAt.getFullYear()}${e.createdAt.getMonth() + 1}${e.createdAt.getDate()}`,
//         userName: pegawaiGrinding.find((pegawai) => pegawai.id == e.userId)?.name ?? "Unknown",
//       }
//     })
//   ).flatMap((e) => e)

// }


// export function generateSlugs(previousBatches: ManualBatch[]): ManualBatchWithSlug[] {

//   const allDates = [...new Set(previousBatches.map((e) => e.createdAt.toDateString()))]

//   return allDates.map((date) =>
//     previousBatches.filter((e) => e.createdAt.toDateString() == date)
//   ).map((batch) =>
//     batch.map((e, index) => {
//       return {
//         ...e,
//         slug: `WIP${index + 1}-${e.createdAt.getFullYear()}${e.createdAt.getMonth() + 1}${e.createdAt.getDate()}`,
//         userName: pegawaiPerebusan.find((pegawai) => pegawai.id == e.userId)?.name ?? "Unknown",
//       }
//     })
//   ).flatMap((e) => e)


// }

//Aqila (AQL), Ibnu (IBN), Damar (DMR), Angela (ANG), Ahlam (AHL)
