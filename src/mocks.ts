import { Activity, ActivityType, Appointment, AppointmentType, IntervalType, DuringType } from './generated/graphql';


const activities: Array<Partial<Activity>> = [
	{
		// id: 'activity1',
		type: ActivityType.Course,
		name: 'Programming help for all',
		appointments: [],
		exclusive: false,
		parent: null
	},
	{
		// id: 'activity2',
		type: ActivityType.Course,
		name: 'but silvan is better',
		appointments: [],
		exclusive: false,
		parent: null
	},
	{
		// id: 'activity2',
		type: ActivityType.Course,
		name: 'felix is okay at programming',
		appointments: [],
		exclusive: false,
		parent: null
	},
];

const appointments: Array<Partial<Appointment>> = [
	{
		// id: 'appointment1',
		type: AppointmentType.Lecture,
		schedule: {
			interval: IntervalType.Mondays,
			during: DuringType.Always,
			from: new Date('2019-01-01T08:00:00'),
			to: new Date('2019-01-01T10:00:00')
		},
		activity: activities[0] as Activity
	},
	{
		// id: 'appointment1',
		type: AppointmentType.Lecture,
		schedule: {
			interval: IntervalType.Wednesdays,
			during: DuringType.Always,
			from: new Date('2019-01-01T08:00:00'),
			to: new Date('2019-01-01T10:00:00')
		},
		activity: activities[1] as Activity
	},
	{
		// id: 'appointment2',
		type: AppointmentType.Lecture,
		schedule: {
			interval: IntervalType.Fridays,
			during: DuringType.Always,
			from: new Date('2019-01-01T10:15:00'),
			to: new Date('2019-01-01T12:00:00')
		},
		activity: activities[2] as Activity
	}
];

activities.forEach(a => a.appointments = appointments as Array<Appointment>);

export { activities, appointments };