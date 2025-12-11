import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { AdminControllerApi, Configuration, type EventResponse } from '@/api-client';
import axiosInstance from '@/utils/axiosInstance';

const config = new Configuration({ basePath: '' });
const adminApi = new AdminControllerApi(config, undefined, axiosInstance);

export const useAdminPendingEvents = () => {
    const [events, setEvents] = useState<EventResponse[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);
    const [selectedEvent, setSelectedEvent] = useState<EventResponse | null>(null);
    const [action, setAction] = useState<'approve' | 'reject' | null>(null);
    const [processingId, setProcessingId] = useState<number | null>(null);

    const fetchPendingEvents = async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await adminApi.getPendingEvents();
            setEvents(response.data);
        } catch (error) {
            console.error('Failed to fetch pending events:', error);
            setError(error instanceof Error ? error : new Error('Failed to fetch pending events'));
            toast.error('Failed to load pending events');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPendingEvents();
    }, []);

    const handleApprove = async () => {
        if (!selectedEvent) return;

        try {
            setProcessingId(selectedEvent.id);
            await adminApi.approveEvent({ id: selectedEvent.id });
            toast.success(`Event "${selectedEvent.title}" approved successfully`);
            setEvents(events.filter(e => e.id !== selectedEvent.id));
        } catch (error) {
            console.error('Failed to approve event:', error);
            toast.error('Failed to approve event');
        } finally {
            setProcessingId(null);
            setSelectedEvent(null);
            setAction(null);
        }
    };

    const handleReject = async () => {
        if (!selectedEvent) return;

        try {
            setProcessingId(selectedEvent.id);
            await adminApi.deleteEventAsAdmin({ id: selectedEvent.id });
            toast.success(`Event "${selectedEvent.title}" rejected`);
            setEvents(events.filter(e => e.id !== selectedEvent.id));
        } catch (error) {
            console.error('Failed to reject event:', error);
            toast.error('Failed to reject event');
        } finally {
            setProcessingId(null);
            setSelectedEvent(null);
            setAction(null);
        }
    };

    const openConfirmDialog = (event: EventResponse, actionType: 'approve' | 'reject') => {
        setSelectedEvent(event);
        setAction(actionType);
    };

    const closeConfirmDialog = () => {
        setAction(null);
    };

    return {
        events,
        loading,
        error,
        selectedEvent,
        action,
        processingId,
        fetchPendingEvents,
        handleApprove,
        handleReject,
        openConfirmDialog,
        closeConfirmDialog
    };
};
