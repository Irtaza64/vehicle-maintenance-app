import { Redirect } from 'expo-router';
import React from 'react';

// This route handles the redirect from Google Auth.
// The session is handled by AuthContext, so we just redirect to the root.
export default function AuthCallback() {
    return <Redirect href="/" />;
}
