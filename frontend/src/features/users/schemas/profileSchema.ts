import { z } from 'zod';

export const profileSchema = z.object({
    name: z.string().min(2, 'Name must be at least 2 characters').max(100).optional(),
    phoneNumber: z.string().regex(/^[+]?[0-9]{10,15}$/, 'Invalid phone number').optional().or(z.literal('')),
    bio: z.string().max(500, 'Bio must not exceed 500 characters').optional().or(z.literal('')),
    location: z.string().max(100).optional().or(z.literal('')),
    dateOfBirth: z.string().optional().or(z.literal('')),
    skills: z.array(z.string()).optional(),
    interests: z.array(z.string()).optional(),
});

export type ProfileFormData = z.infer<typeof profileSchema>;

export const SKILLS = [
    'PUBLIC_SPEAKING', 'COMMUNICATION', 'ACTIVE_LISTENING', 'PRESENTATION', 'WRITING', 'TRANSLATION', 'SIGN_LANGUAGE',
    'LEADERSHIP', 'TEAM_MANAGEMENT', 'PROJECT_MANAGEMENT', 'EVENT_PLANNING', 'COORDINATION', 'PROBLEM_SOLVING',
    'TEACHING', 'TUTORING', 'MENTORING', 'COACHING', 'TRAINING', 'CHILD_CARE',
    'FIRST_AID', 'CPR', 'NURSING', 'COUNSELING', 'MENTAL_HEALTH_SUPPORT',
    'WEB_DEVELOPMENT', 'GRAPHIC_DESIGN', 'VIDEO_EDITING', 'PHOTOGRAPHY', 'SOCIAL_MEDIA_MANAGEMENT',
    'FUNDRAISING', 'GRANT_WRITING', 'ACCOUNTING', 'BUDGETING',
];

export const INTERESTS = [
    'POVERTY_ALLEVIATION', 'HOMELESSNESS', 'HUNGER_RELIEF', 'AFFORDABLE_HOUSING', 'SOCIAL_JUSTICE',
    'EDUCATION', 'YOUTH_DEVELOPMENT', 'LITERACY', 'MENTORSHIP',
    'HEALTHCARE', 'MENTAL_HEALTH', 'DISABILITY_SUPPORT', 'ELDERLY_CARE',
    'ENVIRONMENTAL_CONSERVATION', 'CLIMATE_CHANGE', 'WILDLIFE_PROTECTION',
    'ANIMAL_WELFARE', 'ANIMAL_RESCUE',
    'ARTS_CULTURE', 'COMMUNITY_DEVELOPMENT', 'DISASTER_RELIEF',
];
