
import { faker } from '@faker-js/faker';
import axios from 'axios';

const API_URL = 'http://localhost:8080/api';
const DEFAULT_PASSWORD = 'password123';

// Helper to delay execution
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Store tokens
const tokens = {
    admin: null,
    organizer: null,
    volunteer: null,
    randomOrganizers: [],
    randomVolunteers: []
};

// Data stores
const users = [];
const events = [];
const posts = [];

// Axios instance with interceptor for logging errors
const api = axios.create({ baseURL: API_URL });

api.interceptors.response.use(
    response => response,
    error => {
        // console.error('API Error:', error.response?.data || error.message);
        // Don't reject, just return null so the script continues
        return Promise.resolve({ error: true, data: error.response?.data });
    }
);

async function registerUser(name, email, role) {
    console.log(`Registering ${role}: ${email}...`);
    const payload = {
        username: name,
        email: email,
        password: DEFAULT_PASSWORD,
        gender: faker.person.sex().toUpperCase(),
        role: role
    };

    const res = await api.post('/auth/register', payload);
    if (res.error) {
        if (res.data?.error === "Email already exists") {
            console.log(`User ${email} already exists. Skipping.`);
            return true;
        }
        console.log(`Failed to register ${email}:`, res.data);
        return false;
    }
    return true;
}

async function login(email) {
    const res = await api.post('/auth/login', {
        email: email,
        password: DEFAULT_PASSWORD
    });

    if (res.error) {
        console.log(`Login failed for ${email}`, res.data);
        return null;
    }
    return res.data.accessToken;
}

async function createEvent(token) {
    const title = faker.company.catchPhrase();
    const isPast = faker.datatype.boolean(0.3); // 30% chance of past event
    const eventDate = isPast ? faker.date.recent({ days: 30 }) : faker.date.soon({ days: 60 });
    const endDate = new Date(eventDate.getTime() + 2 * 60 * 60 * 1000); // 2 hours later

    // ISO strings
    const eventParams = new URLSearchParams();
    eventParams.append('title', title);
    eventParams.append('description', faker.lorem.paragraphs(2));
    eventParams.append('location', faker.location.city());
    eventParams.append('eventDateTime', eventDate.toISOString().split('.')[0]); // Simple ISO format
    eventParams.append('endDateTime', endDate.toISOString().split('.')[0]);
    eventParams.append('waitlistEnabled', 'true');
    eventParams.append('maxParticipants', faker.number.int({ min: 5, max: 50 }).toString());
    eventParams.append('tags', faker.helpers.arrayElement(['COMMUNITY_SERVICE', 'ENVIRONMENT', 'EDUCATION', 'HEALTH']));

    const res = await api.post('/events/form', eventParams, {
        headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data' // axios handles boundary
        }
    });

    if (res.error) {
        console.log('Failed to create event:', res.data);
        return null;
    }
    console.log(`Created Event: ${title}`);
    return res.data;
}

async function approveEvent(eventId, adminToken) {
    const res = await api.patch(`/admin/events/${eventId}/approve`, {}, {
        headers: { Authorization: `Bearer ${adminToken}` }
    });
    if (res.error) console.log(`Failed to approve event ${eventId}`);
    else console.log(`Approved event ${eventId}`);
    return !res.error;
}

async function registerForEvent(eventId, token) {
    const res = await api.post(`/events/${eventId}/register`, {}, {
        headers: { Authorization: `Bearer ${token}` }
    });
    if (!res.error) console.log(`Registered for event ${eventId}`);
    else console.log(`Failed register event ${eventId}`, res.data);
    return !res.error;
}

async function createPost(eventId, token) {
    const res = await api.post(`/events/${eventId}/posts`, {
        content: faker.lorem.paragraph()
    }, {
        headers: { Authorization: `Bearer ${token}` }
    });
    if (!res.error) {
        console.log(`Created post in event ${eventId}`);
        return res.data;
    }
    return null;
}

async function reportContent(type, targetId, token) {
    const res = await api.post('/reports', {
        type: type,
        targetId: targetId,
        reason: faker.helpers.arrayElement(['SPAM', 'INAPPROPRIATE_CONTENT', 'OTHER']),
        description: faker.lorem.sentence()
    }, {
        headers: { Authorization: `Bearer ${token}` }
    });
    if (!res.error) console.log(`Reported ${type} ${targetId}`);
}

async function main() {
    console.log('🌱 Starting Database Seeding...');

    // 1. Create Main Users
    await registerUser('Admin User', 'test@admin.com', 'ADMIN');
    await registerUser('Organizer User', 'test@organizer.com', 'EVENT_ORGANIZER');
    await registerUser('Volunteer User', 'test@volunteer.com', 'VOLUNTEER');

    // 2. Login as Main Users
    tokens.admin = await login('test@admin.com');
    tokens.organizer = await login('test@organizer.com');
    tokens.volunteer = await login('test@volunteer.com');

    if (!tokens.admin || !tokens.organizer || !tokens.volunteer) {
        console.error('CRITICAL: Failed to login as one of the test users. Make sure backend is running.');
        // process.exit(1); 
        // Continue anyway to try random users
    }

    // 3. Create Random Users
    console.log('Creating random users...');
    for (let i = 0; i < 20; i++) {
        await delay(500); // Prevent rate limit
        const role = faker.helpers.arrayElement(['VOLUNTEER', 'EVENT_ORGANIZER']);
        const email = faker.internet.email();
        const name = faker.person.fullName();

        const success = await registerUser(name, email, role);
        if (success) {
            await delay(500);
            const token = await login(email);
            if (token) {
                if (role === 'EVENT_ORGANIZER') tokens.randomOrganizers.push(token);
                else tokens.randomVolunteers.push(token);
            }
        }
    }

    // 4. Create Events
    console.log('Creating events...');
    const allOrganizers = [tokens.organizer, ...tokens.randomOrganizers].filter(Boolean);

    for (const organizerToken of allOrganizers) {
        // Each creates 1-3 events
        const numEvents = faker.number.int({ min: 1, max: 3 });
        for (let i = 0; i < numEvents; i++) {
            await delay(1000); // Prevent rate limit
            const event = await createEvent(organizerToken);
            if (event) {
                events.push(event);
                // Admin approves it
                if (tokens.admin) {
                    await delay(300);
                    await approveEvent(event.id, tokens.admin);
                }
            }
        }
    }

    // 5. Registrations & Posts
    console.log('Registering users and posting...');
    const allVolunteers = [tokens.volunteer, ...tokens.randomVolunteers].filter(Boolean);

    for (const event of events) {
        // Randomly register volunteers
        const shuffled = allVolunteers.sort(() => 0.5 - Math.random());
        const selected = shuffled.slice(0, faker.number.int({ min: 0, max: Math.min(10, shuffled.length) }));

        for (const volToken of selected) {
            await delay(500); // Prevent rate limit
            await registerForEvent(event.id, volToken);

            // 20% chance to post
            if (Math.random() < 0.2) {
                await delay(500);
                const post = await createPost(event.id, volToken);
                if (post) posts.push(post);
            }
        }
    }

    // 6. Reports
    console.log('Creating reports...');
    if (posts.length > 0 && allVolunteers.length > 0) {
        for (let i = 0; i < 10; i++) {
            await delay(500);
            const post = faker.helpers.arrayElement(posts);
            const reporter = faker.helpers.arrayElement(allVolunteers);
            await reportContent('POST', post.id, reporter);
        }
    }

    console.log('✅ Seeding Completed!');
}

main();
