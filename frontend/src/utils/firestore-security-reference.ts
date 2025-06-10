/**
 * This file contains reference Firestore security rules documentation
 * for the Lucent Analytics application.
 * 
 * These rules need to be copied into your Firebase console's Firestore Rules section.
 */

/**
 * Firestore Security Rules
 * 
 * rules_version = '2';
 * service cloud.firestore {
 *   match /databases/{database}/documents {
 *     // Allow users to read and write their own user data
 *     match /users/{userId} {
 *       allow read, write: if request.auth != null && request.auth.uid == userId;
 *     }
 *     
 *     // Allow users to read and write organizations they own or are members of
 *     match /organizations/{organizationId} {
 *       allow read: if request.auth != null && 
 *         (resource.data.ownerId == request.auth.uid || 
 *         request.auth.uid in resource.data.members);
 *       
 *       // Only the owner can update or delete the organization
 *       allow update, delete: if request.auth != null && resource.data.ownerId == request.auth.uid;
 *       
 *       // Anyone can create a new organization, and they will be set as the owner
 *       allow create: if request.auth != null && request.resource.data.ownerId == request.auth.uid;
 *     }
 *   }
 * }
 */

// This file is for documentation only and does not export anything
export {};
