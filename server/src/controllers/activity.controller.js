// ✅ Get all activities (temporary response)
export const getActivities = async (req, res) => {
    try {
        const activities = [
            { id: 1, user: 'Customer', action: 'Booked a table', timestamp: '2025-04-10 10:00' },
            { id: 2, user: 'Manager', action: 'Assigned room 102', timestamp: '2025-04-10 10:30' }
        ];

        res.status(200).json({ message: "Activities fetched successfully", activities });
    } catch (error) {
        res.status(500).json({ message: "Error fetching activities", error });
    }
};