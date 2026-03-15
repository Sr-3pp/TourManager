export default defineEventHandler(async () => {
    const tours = await Tour.find().populate('organizer')
    return tours
})