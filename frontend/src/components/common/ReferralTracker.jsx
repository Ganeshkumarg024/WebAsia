import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * Component to track referral codes from the URL
 */
const ReferralTracker = () => {
    const location = useLocation();

    useEffect(() => {
        const queryParams = new URLSearchParams(location.search);
        const refCode = queryParams.get('ref');

        if (refCode) {
            // Store the referral code in localStorage
            // We set an expiry of 30 days for the referral cookie/storage
            const referralData = {
                code: refCode,
                expiry: Date.now() + 30 * 24 * 60 * 60 * 1000 // 30 days
            };

            localStorage.setItem('wa_referral', JSON.stringify(referralData));
            console.log('Referral code captured and stored:', refCode);
        }
    }, [location]);

    return null; // This component doesn't render anything
};

export default ReferralTracker;
