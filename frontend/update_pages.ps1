# Script to add DashboardLayout to all CRM pages

$pages = @(
    # Designer pages
    @{Path="src\pages\designer\Workspace.jsx"; Breadcrumbs="['Designer', 'Workspace']"},
    @{Path="src\pages\designer\UploadDesign.jsx"; Breadcrumbs="['Designer', 'Upload Design']"},
    @{Path="src\pages\designer\Analytics.jsx"; Breadcrumbs="['Designer', 'Analytics']"},
    
    # Manager pages
    @{Path="src\pages\manager\Queue.jsx"; Breadcrumbs="['Manager', 'Queue']"},
    @{Path="src\pages\manager\ReviewDetail.jsx"; Breadcrumbs="['Manager', 'Review Detail']"},
    @{Path="src\pages\manager\DesignerAnalytics.jsx"; Breadcrumbs="['Manager', 'Designer Analytics']"},
    
    # Admin pages
    @{Path="src\pages\admin\Dashboard.jsx"; Breadcrumbs="['Admin', 'Dashboard']"},
    @{Path="src\pages\admin\SubscriptionPlans.jsx"; Breadcrumbs="['Admin', 'Plans']"},
    @{Path="src\pages\admin\EditPlan.jsx"; Breadcrumbs="['Admin', 'Edit Plan']"},
    @{Path="src\pages\admin\TestimonialModeration.jsx"; Breadcrumbs="['Admin', 'Testimonials']"},
    @{Path="src\pages\admin\LeadManager.jsx"; Breadcrumbs="['Admin', 'Leads']"},
    @{Path="src\pages\admin\AffiliatePayouts.jsx"; Breadcrumbs="['Admin', 'Payouts']"},
    
    # Affiliate pages
    @{Path="src\pages\affiliate\Dashboard.jsx"; Breadcrumbs="['Affiliate', 'Dashboard']"},
    @{Path="src\pages\affiliate\Settings.jsx"; Breadcrumbs="['Affiliate', 'Settings']"}
)

Write-Host "Pages to update: $($pages.Count)"
