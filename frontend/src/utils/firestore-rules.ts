/**
 * Firestore Security Rules Documentation
 * 
 * This file documents the required Firestore security rules for the Lucent Analytics application.
 * Copy these rules to your Firebase console's Firestore Rules section.
 */

/**
 * Organizations Collection Rules
 * 
 * These rules ensure:
 * 1. Only authenticated users can read/write
 * 2. Users can only read organizations they own or are members of
 * 3. Only owners can update/delete their organizations
 */
export const organizationsRules = `
match /organizations/{organizationId} {
  // Allow read if the user is the owner or a member of the organization
  allow read: if request.auth != null && 
               (resource.data.ownerId == request.auth.uid ||
                request.auth.uid in resource.data.members);
               
  // Allow write if the user is the owner of the organization
  allow write: if request.auth != null && 
                (resource.data == null || resource.data.ownerId == request.auth.uid);
}
`;

/**
 * Implementation Instructions
 * 
 * 1. Go to Firebase Console
 * 2. Select your project
 * 3. Navigate to Firestore Database
 * 4. Click on "Rules" tab
 * 5. Update rules with the patterns defined in this file
 * 6. Click "Publish"
 * 
 * Complete Ruleset Example:
 * 
 * ```
 * rules_version = '2';
 * service cloud.firestore {
 *   match /databases/{database}/documents {
 *     match /organizations/{organizationId} {
 *       allow read: if request.auth != null && 
 *                    (resource.data.ownerId == request.auth.uid ||
 *                     request.auth.uid in resource.data.members);
 *                    
 *       allow write: if request.auth != null && 
 *                     (resource.data == null || resource.data.ownerId == request.auth.uid);
 *     }
 *     
 *     // Add other collection rules as needed
 *   }
 * }
 * ```
 */

/**
 * Troubleshooting Permission Issues
 * 
 * If you encounter "Permission denied" errors:
 * 
 * 1. Verify the user is authenticated
 * 2. Check that the security rules match your app's access patterns
 * 3. Confirm the data structure matches what the rules expect
 * 4. Use Firebase console's Rules Playground to test your rules
 * 5. Check browser console for detailed error messages
 */
