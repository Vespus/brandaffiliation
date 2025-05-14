'use client';

import * as React from 'react';

import { useChat as useBaseChat } from '@ai-sdk/react';

export const useChat = () => {
    // remove when you implement the route /api/ai/command
    const abortControllerRef = React.useRef<AbortController | null>(null);
    const _abortFakeStream = () => {
        if (abortControllerRef.current) {
            abortControllerRef.current.abort();
            abortControllerRef.current = null;
        }
    };

    const chat = useBaseChat({
        id: 'editor',
        api: '/api/editor',
    });

    return { ...chat, _abortFakeStream };
};