const NOTIFICATIONS = [
  {
    id: '1',
    type: 'appointment',
    title: 'Appointment Confirmed',
    message: 'Your appointment with Dr. Sarah Johnson is confirmed for tomorrow at 10:00 AM',
    time: '10 min ago',
    read: false,
    icon: 'event_available',
    color: 'text-blue-500',
    bgColor: 'bg-blue-50 dark:bg-blue-900/30'
  },
  {
    id: '2',
    type: 'medicine',
    title: 'Medicine Reminder',
    message: 'Time to take your Dolo 650mg tablet',
    time: '2 hours ago',
    read: false,
    icon: 'medication',
    color: 'text-green-500',
    bgColor: 'bg-green-50 dark:bg-green-900/30'
  },
  {
    id: '3',
    type: 'offer',
    title: 'Special Offer',
    message: 'Get 20% off on all lab tests this week',
    time: '5 hours ago',
    read: true,
    icon: 'local_offer',
    color: 'text-yellow-500',
    bgColor: 'bg-yellow-50 dark:bg-yellow-900/30'
  },
  {
    id: '4',
    type: 'activity',
    title: 'Lab Results Ready',
    message: 'Your recent blood test results are now available',
    time: '1 day ago',
    read: true,
    icon: 'assignment',
    color: 'text-purple-500',
    bgColor: 'bg-purple-50 dark:bg-purple-900/30'
  },
  {
    id: '5',
    type: 'appointment',
    title: 'Appointment Reminder',
    message: 'Your follow-up appointment is in 1 hour',
    time: '2 days ago',
    read: true,
    icon: 'event_available',
    color: 'text-blue-500',
    bgColor: 'bg-blue-50 dark:bg-blue-900/30'
  }
];

export default NOTIFICATIONS;
