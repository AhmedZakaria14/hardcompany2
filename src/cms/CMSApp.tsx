import React, { useState, useEffect } from "react";
import {
  Language,
  Property,
  Project,
  BlogPost,
  Testimonial,
  JoinListSubscriber,
  ListingStatus,
  ProjectStatus,
  BlogStatus,
} from "../types";
import {
  TeamMember,
  FaqEntity,
  OfficeLocation,
  Certification,
  BusinessStatistic,
  PartnerBrand,
  EnhancedTestimonial,
} from "../types/businessEntities";
import { useData } from "../context/DataContext";
import { CMSAuth } from "./CMSAuth";
import { CMSLayout, CMSTab } from "./CMSLayout";
import { CMSDashboard } from "./CMSDashboard";
import { CMSPropertiesList } from "./properties/CMSPropertiesList";
import { CMSPropertyFormModal } from "./properties/CMSPropertyFormModal";
import { CMSProjectsList } from "./projects/CMSProjectsList";
import { CMSProjectFormModal } from "./projects/CMSProjectFormModal";
import { CMSBlogList } from "./blog/CMSBlogList";
import { CMSBlogFormModal } from "./blog/CMSBlogFormModal";
import { CMSTestimonialsList } from "./testimonials/CMSTestimonialsList";
import { CMSTestimonialFormModal } from "./testimonials/CMSTestimonialFormModal";
import { CMSJoinList } from "./subscribers/CMSJoinList";
import { CMSAddSubscriberModal } from "./subscribers/CMSAddSubscriberModal";
import { getLocalizedText } from "../lib/utils";
import { CMSLeadsList } from "./leads/CMSLeadsList";
import { CMSAppointmentsList } from "./appointments/CMSAppointmentsList";
import { CMSSiteContentEditor } from "./content/CMSSiteContentEditor";
import { CMSFormSchemaEditor } from "./forms/CMSFormSchemaEditor";
import { CMSCalculatorConfig } from "./calculators/CMSCalculatorConfig";
import { CMSSettings } from "./settings/CMSSettings";

// Entity Modules
import { CMSTeamList } from "./entities/CMSTeamList";
import { CMSTeamFormModal } from "./entities/CMSTeamFormModal";
import { CMSFaqList } from "./entities/CMSFaqList";
import { CMSFaqFormModal } from "./entities/CMSFaqFormModal";
import { CMSOfficesList } from "./entities/CMSOfficesList";
import { CMSOfficeFormModal } from "./entities/CMSOfficeFormModal";
import { CMSCertificationsList } from "./entities/CMSCertificationsList";
import { CMSCertificationFormModal } from "./entities/CMSCertificationFormModal";
import { CMSStatisticsList } from "./entities/CMSStatisticsList";
import { CMSStatisticFormModal } from "./entities/CMSStatisticFormModal";
import { CMSPartnersList } from "./entities/CMSPartnersList";
import { CMSPartnerFormModal } from "./entities/CMSPartnerFormModal";

import { notifyAdminAuthChange } from "../lib/adminAuth";
import { subscribeAuth, logoutAdmin } from "../lib/firebaseService";

interface CMSAppProps {
  onReturnToSite: () => void;
  onViewPropertyOnSite?: (property: Property) => void;
  onViewProjectOnSite?: (project: Project) => void;
  onViewBlogPostOnSite?: (post: BlogPost) => void;
  language: Language;
  onLanguageChange: (lang: Language) => void;
}

export const CMSApp: React.FC<CMSAppProps> = ({
  onReturnToSite,
  onViewPropertyOnSite,
  onViewProjectOnSite,
  onViewBlogPostOnSite,
  language,
  onLanguageChange,
}) => {
  const {
    properties,
    projects,
    blogPosts,
    testimonials,
    subscribers,
    leads,
    teamMembers,
    faqs,
    offices,
    certifications,
    statistics,
    partnerBrands,
    addProperty,
    updateProperty,
    deleteProperty,
    resetPropertiesToDefault,
    addProject,
    updateProject,
    deleteProject,
    resetProjectsToDefault,
    addBlogPost,
    updateBlogPost,
    deleteBlogPost,
    resetBlogPostsToDefault,
    addTestimonial,
    updateTestimonial,
    deleteTestimonial,
    resetTestimonialsToDefault,
    addSubscriber,
    updateSubscriber,
    deleteSubscriber,
    toggleSubscriberStatus,
    resetSubscribersToDefault,
    addTeamMember,
    updateTeamMember,
    deleteTeamMember,
    resetTeamMembersToDefault,
    addFaq,
    updateFaq,
    deleteFaq,
    resetFaqsToDefault,
    addOffice,
    updateOffice,
    deleteOffice,
    resetOfficesToDefault,
    addCertification,
    updateCertification,
    deleteCertification,
    resetCertificationsToDefault,
    addStatistic,
    updateStatistic,
    deleteStatistic,
    resetStatisticsToDefault,
    addPartnerBrand,
    updatePartnerBrand,
    deletePartnerBrand,
    resetPartnerBrandsToDefault,
  } = useData();

  const [adminUser, setAdminUser] = useState<{
    name: string;
    email: string;
    role: string;
  } | null>(() => {
    try {
      const stored = sessionStorage.getItem("hard_cms_admin_session");
      if (stored) return JSON.parse(stored);
    } catch {
      // Fall through
    }
    return null;
  });

  const [isResolvingAuth, setIsResolvingAuth] = useState(() => {
    try {
      const stored = sessionStorage.getItem("hard_cms_admin_session");
      return !stored;
    } catch {
      return true;
    }
  });

  useEffect(() => {
    // 500ms safety boundary to ensure resolves cleanly without getting stuck
    const safetyTimer = setTimeout(() => {
      setIsResolvingAuth(false);
    }, 500);

    const unsubscribe = subscribeAuth((fbAdmin) => {
      clearTimeout(safetyTimer);
      if (fbAdmin) {
        const userObj = {
          name: fbAdmin.displayName || "Executive Admin",
          email: fbAdmin.email,
          role: fbAdmin.role || "superadmin",
        };
        setAdminUser(userObj);
        try {
          sessionStorage.setItem(
            "hard_cms_admin_session",
            JSON.stringify(userObj),
          );
          notifyAdminAuthChange();
        } catch {
          // Ignore
        }
      } else {
        // If no firebase user, check if we have a valid fallback session in sessionStorage
        try {
          const stored = sessionStorage.getItem("hard_cms_admin_session");
          if (!stored) {
            setAdminUser(null);
            notifyAdminAuthChange();
          }
        } catch {
          setAdminUser(null);
        }
      }
      setIsResolvingAuth(false);
    });

    return () => {
      clearTimeout(safetyTimer);
      unsubscribe();
    };
  }, []);

  const [activeTab, setActiveTab] = useState<CMSTab>("properties");

  // Modals state
  const [isPropertyModalOpen, setIsPropertyModalOpen] = useState(false);
  const [editingProperty, setEditingProperty] = useState<Property | null>(null);

  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);

  const [isBlogModalOpen, setIsBlogModalOpen] = useState(false);
  const [editingBlogPost, setEditingBlogPost] = useState<BlogPost | null>(null);

  const [isTestimonialModalOpen, setIsTestimonialModalOpen] = useState(false);
  const [editingTestimonial, setEditingTestimonial] =
    useState<Testimonial | null>(null);

  const [isSubscriberModalOpen, setIsSubscriberModalOpen] = useState(false);

  // Entities Modals state
  const [isTeamModalOpen, setIsTeamModalOpen] = useState(false);
  const [editingTeamMember, setEditingTeamMember] = useState<TeamMember | null>(
    null,
  );

  const [isFaqModalOpen, setIsFaqModalOpen] = useState(false);
  const [editingFaq, setEditingFaq] = useState<FaqEntity | null>(null);

  const [isOfficeModalOpen, setIsOfficeModalOpen] = useState(false);
  const [editingOffice, setEditingOffice] = useState<OfficeLocation | null>(
    null,
  );

  const [isCertModalOpen, setIsCertModalOpen] = useState(false);
  const [editingCert, setEditingCert] = useState<Certification | null>(null);

  const [isStatModalOpen, setIsStatModalOpen] = useState(false);
  const [editingStat, setEditingStat] = useState<BusinessStatistic | null>(
    null,
  );

  const [isPartnerModalOpen, setIsPartnerModalOpen] = useState(false);
  const [editingPartner, setEditingPartner] = useState<PartnerBrand | null>(
    null,
  );

  const handleLoginSuccess = (user: {
    name: string;
    email: string;
    role: string;
  }) => {
    setAdminUser(user);
    try {
      sessionStorage.setItem("hard_cms_admin_session", JSON.stringify(user));
      notifyAdminAuthChange();
    } catch (e) {
      console.warn("Session storage write failed:", e);
    }
  };

  const handleLogout = async () => {
    try {
      await logoutAdmin();
    } catch {
      // Ignore
    }
    setAdminUser(null);
    try {
      sessionStorage.removeItem("hard_cms_admin_session");
      notifyAdminAuthChange();
    } catch (e) {
      console.warn("Session storage remove failed:", e);
    }
  };

  // --- PROPERTIES HANDLERS ---
  const handleOpenAddProperty = () => {
    setEditingProperty(null);
    setIsPropertyModalOpen(true);
  };
  const handleOpenEditProperty = (property: Property) => {
    setEditingProperty(property);
    setIsPropertyModalOpen(true);
  };
  const handleSaveProperty = async (propertyData: Partial<Property>) => {
    if (editingProperty) {
      await updateProperty(editingProperty.id, propertyData);
    } else {
      await addProperty(propertyData);
    }
  };
  const handleDuplicateProperty = async (property: Property) => {
    const titleEn = getLocalizedText(property.title, 'en');
    const titleAr = getLocalizedText(property.title, 'ar');
    const duplicatedData: Partial<Property> = {
      ...property,
      title: {
        en: `${titleEn} (Copy)`,
        ar: `${titleAr} (نسخة)`,
      },
      slug: `${property.slug}-copy-${Date.now()}`,
      featured: false,
    };
    delete duplicatedData.id;
    await addProperty(duplicatedData);
  };
  const handleTogglePropertyFeatured = async (property: Property) => {
    await updateProperty(property.id, { featured: !property.featured });
  };
  const handleQuickPropertyStatusChange = async (
    property: Property,
    newStatus: ListingStatus,
  ) => {
    await updateProperty(property.id, { status: newStatus });
  };
  const handleViewPropertyLive = (property: Property) => {
    if (onViewPropertyOnSite) onViewPropertyOnSite(property);
    else onReturnToSite();
  };

  // --- PROJECTS HANDLERS ---
  const handleOpenAddProject = () => {
    setEditingProject(null);
    setIsProjectModalOpen(true);
  };
  const handleOpenEditProject = (project: Project) => {
    setEditingProject(project);
    setIsProjectModalOpen(true);
  };
  const handleSaveProject = async (projectData: Partial<Project>) => {
    if (editingProject) {
      await updateProject(editingProject.id, projectData);
    } else {
      await addProject(projectData);
    }
  };
  const handleDuplicateProject = async (project: Project) => {
    const titleEn = getLocalizedText(project.title, 'en');
    const titleAr = getLocalizedText(project.title, 'ar');
    const duplicated: Partial<Project> = {
      ...project,
      title: {
        en: `${titleEn} (Copy)`,
        ar: `${titleAr} (نسخة)`,
      },
      slug: `${project.slug}-copy-${Date.now()}`,
      featured: false,
    };
    delete duplicated.id;
    await addProject(duplicated);
  };
  const handleToggleProjectFeatured = async (project: Project) => {
    await updateProject(project.id, { featured: !project.featured });
  };
  const handleQuickProjectStatusChange = async (
    project: Project,
    newStatus: ProjectStatus,
  ) => {
    await updateProject(project.id, { status: newStatus });
  };
  const handleViewProjectLive = (project: Project) => {
    if (onViewProjectOnSite) onViewProjectOnSite(project);
    else onReturnToSite();
  };

  // --- BLOG HANDLERS ---
  const handleOpenAddBlogPost = () => {
    setEditingBlogPost(null);
    setIsBlogModalOpen(true);
  };
  const handleOpenEditBlogPost = (post: BlogPost) => {
    setEditingBlogPost(post);
    setIsBlogModalOpen(true);
  };
  const handleSaveBlogPost = async (postData: Partial<BlogPost>) => {
    if (editingBlogPost) {
      await updateBlogPost(editingBlogPost.id, postData);
    } else {
      await addBlogPost(postData);
    }
  };
  const handleDuplicateBlogPost = async (post: BlogPost) => {
    const titleEn = getLocalizedText(post.title, 'en');
    const titleAr = getLocalizedText(post.title, 'ar');
    const duplicated: Partial<BlogPost> = {
      ...post,
      title: {
        en: `${titleEn} (Copy)`,
        ar: `${titleAr} (نسخة)`,
      },
      slug: `${post.slug}-copy-${Date.now()}`,
      featured: false,
    };
    delete duplicated.id;
    await addBlogPost(duplicated);
  };
  const handleToggleBlogFeatured = async (post: BlogPost) => {
    await updateBlogPost(post.id, { featured: !post.featured });
  };
  const handleQuickBlogStatusChange = async (
    post: BlogPost,
    newStatus: BlogStatus,
  ) => {
    await updateBlogPost(post.id, { status: newStatus });
  };
  const handleViewBlogLive = (post: BlogPost) => {
    if (onViewBlogPostOnSite) onViewBlogPostOnSite(post);
    else onReturnToSite();
  };

  // --- TESTIMONIALS HANDLERS ---
  const handleOpenAddTestimonial = () => {
    setEditingTestimonial(null);
    setIsTestimonialModalOpen(true);
  };
  const handleOpenEditTestimonial = (story: Testimonial) => {
    setEditingTestimonial(story);
    setIsTestimonialModalOpen(true);
  };
  const handleSaveTestimonial = async (storyData: Partial<Testimonial>) => {
    if (editingTestimonial) {
      await updateTestimonial(editingTestimonial.id, storyData);
    } else {
      await addTestimonial(storyData);
    }
  };

  // --- JOIN LIST SUBSCRIBERS HANDLERS ---
  const handleOpenAddSubscriber = () => {
    setIsSubscriberModalOpen(true);
  };
  const handleSaveSubscriber = async (
    email: string,
    source: string,
    notes: string,
  ) => {
    await addSubscriber(email, source, notes);
  };

  // --- BUSINESS ENTITIES HANDLERS ---
  // Team
  const handleOpenAddTeam = () => {
    setEditingTeamMember(null);
    setIsTeamModalOpen(true);
  };
  const handleOpenEditTeam = (item: TeamMember) => {
    setEditingTeamMember(item);
    setIsTeamModalOpen(true);
  };
  const handleSaveTeam = async (data: Partial<TeamMember>) => {
    if (editingTeamMember) await updateTeamMember(editingTeamMember.id, data);
    else await addTeamMember(data);
  };

  // FAQs
  const handleOpenAddFaq = () => {
    setEditingFaq(null);
    setIsFaqModalOpen(true);
  };
  const handleOpenEditFaq = (item: FaqEntity) => {
    setEditingFaq(item);
    setIsFaqModalOpen(true);
  };
  const handleSaveFaq = async (data: Partial<FaqEntity>) => {
    if (editingFaq) await updateFaq(editingFaq.id, data);
    else await addFaq(data);
  };

  // Offices
  const handleOpenAddOffice = () => {
    setEditingOffice(null);
    setIsOfficeModalOpen(true);
  };
  const handleOpenEditOffice = (item: OfficeLocation) => {
    setEditingOffice(item);
    setIsOfficeModalOpen(true);
  };
  const handleSaveOffice = async (data: Partial<OfficeLocation>) => {
    if (editingOffice) await updateOffice(editingOffice.id, data);
    else await addOffice(data);
  };

  // Certifications
  const handleOpenAddCert = () => {
    setEditingCert(null);
    setIsCertModalOpen(true);
  };
  const handleOpenEditCert = (item: Certification) => {
    setEditingCert(item);
    setIsCertModalOpen(true);
  };
  const handleSaveCert = async (data: Partial<Certification>) => {
    if (editingCert) await updateCertification(editingCert.id, data);
    else await addCertification(data);
  };

  // Statistics
  const handleOpenAddStat = () => {
    setEditingStat(null);
    setIsStatModalOpen(true);
  };
  const handleOpenEditStat = (item: BusinessStatistic) => {
    setEditingStat(item);
    setIsStatModalOpen(true);
  };
  const handleSaveStat = async (data: Partial<BusinessStatistic>) => {
    if (editingStat) await updateStatistic(editingStat.id, data);
    else await addStatistic(data);
  };

  // Partners
  const handleOpenAddPartner = () => {
    setEditingPartner(null);
    setIsPartnerModalOpen(true);
  };
  const handleOpenEditPartner = (item: PartnerBrand) => {
    setEditingPartner(item);
    setIsPartnerModalOpen(true);
  };
  const handleSavePartner = async (data: Partial<PartnerBrand>) => {
    if (editingPartner) await updatePartnerBrand(editingPartner.id, data);
    else await addPartnerBrand(data);
  };

  // Reset all repository data
  const handleResetAllData = async () => {
    await resetPropertiesToDefault();
    await resetProjectsToDefault();
    await resetBlogPostsToDefault();
    await resetTestimonialsToDefault();
    await resetSubscribersToDefault();
    resetTeamMembersToDefault();
    resetFaqsToDefault();
    resetOfficesToDefault();
    resetCertificationsToDefault();
    resetStatisticsToDefault();
    resetPartnerBrandsToDefault();
  };

  const isAr = language === "ar";

  if (isResolvingAuth) {
    return (
      <div
        dir={isAr ? "rtl" : "ltr"}
        className="min-h-screen bg-slate-950 text-white flex flex-col items-center justify-center p-6 space-y-4 font-ui-sans"
      >
        <div className="w-12 h-12 rounded-2xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center animate-pulse">
          <svg
            className="animate-spin h-6 w-6 text-blue-400"
            viewBox="0 0 24 24"
            fill="none"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8v8H4z"
            />
          </svg>
        </div>
        <div className="text-center space-y-1">
          <h3 className="text-sm font-bold text-slate-200">
            {isAr
              ? "جاري التحقق من هوية المسؤول وصلاحيات الجلسة..."
              : "Resolving admin credentials & session authorization..."}
          </h3>
          <p className="text-xs text-slate-500">
            {isAr
              ? "التحقق الآمن عبر Firebase Authentication"
              : "Verifying encrypted identity via Firebase Authentication"}
          </p>
        </div>
      </div>
    );
  }

  if (!adminUser) {
    return (
      <CMSAuth
        onLoginSuccess={handleLoginSuccess}
        onCancel={onReturnToSite}
        language={language}
        onLanguageChange={onLanguageChange}
      />
    );
  }

  return (
    <CMSLayout
      activeTab={activeTab}
      onSelectTab={setActiveTab}
      onLogout={handleLogout}
      onViewLiveSite={onReturnToSite}
      adminUser={adminUser}
      language={language}
      onLanguageChange={onLanguageChange}
    >
      {/* 1. Dashboard View */}
      {activeTab === "dashboard" && (
        <CMSDashboard
          properties={properties}
          projects={projects}
          blogPosts={blogPosts}
          testimonials={testimonials}
          subscribers={subscribers}
          leads={leads}
          onNavigateToProperties={() => setActiveTab("properties")}
          onNavigateToProjects={() => setActiveTab("projects")}
          onNavigateToBlog={() => setActiveTab("blog")}
          onNavigateToTestimonials={() => setActiveTab("testimonials")}
          onNavigateToSubscribers={() => setActiveTab("subscribers")}
          onNavigateToLeads={() => setActiveTab("leads")}
          onNavigateToAppointments={() => setActiveTab("appointments")}
          onNavigateToContent={() => setActiveTab("content")}
          onAddProperty={handleOpenAddProperty}
          onAddProject={handleOpenAddProject}
          onAddBlogPost={handleOpenAddBlogPost}
          onAddTestimonial={handleOpenAddTestimonial}
          onAddSubscriber={handleOpenAddSubscriber}
          onSelectProperty={handleOpenEditProperty}
          language={language}
        />
      )}

      {/* 2. Properties Catalog */}
      {activeTab === "properties" && (
        <CMSPropertiesList
          properties={properties}
          onAddProperty={handleOpenAddProperty}
          onEditProperty={handleOpenEditProperty}
          onDeleteProperty={deleteProperty}
          onDuplicateProperty={handleDuplicateProperty}
          onToggleFeatured={handleTogglePropertyFeatured}
          onQuickStatusChange={handleQuickPropertyStatusChange}
          onViewLive={handleViewPropertyLive}
          language={language}
        />
      )}

      {/* 3. Major Projects & Off-Plan */}
      {activeTab === "projects" && (
        <CMSProjectsList
          projects={projects}
          onAddProject={handleOpenAddProject}
          onEditProject={handleOpenEditProject}
          onDeleteProject={deleteProject}
          onDuplicateProject={handleDuplicateProject}
          onToggleFeatured={handleToggleProjectFeatured}
          onQuickStatusChange={handleQuickProjectStatusChange}
          onViewLive={handleViewProjectLive}
          language={language}
        />
      )}

      {/* 3.5. Site Content & Drafts */}
      {activeTab === "content" && <CMSSiteContentEditor language={language} />}

      {/* 3.6. Controlled Form Builder & Schemas */}
      {activeTab === "forms" && (
        <CMSFormSchemaEditor
          language={language}
          currentAdminEmail={adminUser?.email || ""}
        />
      )}

      {/* 3.7. Versioned Calculator Configuration */}
      {activeTab === "calculators" && (
        <CMSCalculatorConfig
          language={language}
          currentAdminEmail={adminUser?.email || ""}
        />
      )}

      {/* Team Members */}
      {activeTab === "team" && (
        <CMSTeamList
          teamMembers={teamMembers}
          onAddMember={handleOpenAddTeam}
          onEditMember={handleOpenEditTeam}
          onDeleteMember={deleteTeamMember}
          onResetToDefaults={resetTeamMembersToDefault}
          language={language}
        />
      )}

      {/* FAQs */}
      {activeTab === "faqs" && (
        <CMSFaqList
          faqs={faqs}
          onAddFaq={handleOpenAddFaq}
          onEditFaq={handleOpenEditFaq}
          onDeleteFaq={deleteFaq}
          onResetToDefaults={resetFaqsToDefault}
          language={language}
        />
      )}

      {/* Offices & Locations */}
      {activeTab === "offices" && (
        <CMSOfficesList
          offices={offices}
          onAddOffice={handleOpenAddOffice}
          onEditOffice={handleOpenEditOffice}
          onDeleteOffice={deleteOffice}
          onResetToDefaults={resetOfficesToDefault}
          language={language}
        />
      )}

      {/* Certifications */}
      {activeTab === "certifications" && (
        <CMSCertificationsList
          certifications={certifications}
          onAddCertification={handleOpenAddCert}
          onEditCertification={handleOpenEditCert}
          onDeleteCertification={deleteCertification}
          onResetToDefaults={resetCertificationsToDefault}
          language={language}
        />
      )}

      {/* Statistics & Metrics */}
      {activeTab === "statistics" && (
        <CMSStatisticsList
          statistics={statistics}
          onAddStatistic={handleOpenAddStat}
          onEditStatistic={handleOpenEditStat}
          onDeleteStatistic={deleteStatistic}
          onResetToDefaults={resetStatisticsToDefault}
          language={language}
        />
      )}

      {/* Partners & Brands */}
      {activeTab === "partners" && (
        <CMSPartnersList
          partners={partnerBrands}
          onAddPartner={handleOpenAddPartner}
          onEditPartner={handleOpenEditPartner}
          onDeletePartner={deletePartnerBrand}
          onResetToDefaults={resetPartnerBrandsToDefault}
          language={language}
        />
      )}

      {/* 4. Blog & Market Insights */}
      {activeTab === "blog" && (
        <CMSBlogList
          blogPosts={blogPosts}
          onAddPost={handleOpenAddBlogPost}
          onEditPost={handleOpenEditBlogPost}
          onDeletePost={deleteBlogPost}
          onDuplicatePost={handleDuplicateBlogPost}
          onToggleFeatured={handleToggleBlogFeatured}
          onQuickStatusChange={handleQuickBlogStatusChange}
          onViewLive={handleViewBlogLive}
          language={language}
        />
      )}

      {/* 5. Client Success Stories */}
      {activeTab === "testimonials" && (
        <CMSTestimonialsList
          testimonials={testimonials}
          onAddStory={handleOpenAddTestimonial}
          onEditStory={handleOpenEditTestimonial}
          onDeleteStory={deleteTestimonial}
          onResetToDefault={resetTestimonialsToDefault}
          language={language}
        />
      )}

      {/* 6. Join List */}
      {activeTab === "subscribers" && (
        <CMSJoinList
          subscribers={subscribers}
          onAddSubscriber={handleOpenAddSubscriber}
          onUpdateSubscriber={updateSubscriber}
          onToggleStatus={toggleSubscriberStatus}
          onDeleteSubscriber={deleteSubscriber}
          onResetToDefault={resetSubscribersToDefault}
          language={language}
        />
      )}

      {/* 7. Inbound Leads */}
      {activeTab === "leads" && (
        <CMSLeadsList
          leads={leads}
          language={language}
          currentAdminUser={adminUser || undefined}
        />
      )}

      {/* 8. Appointments & Field Viewings */}
      {activeTab === "appointments" && (
        <CMSAppointmentsList
          language={language}
          currentAdminUser={adminUser || undefined}
        />
      )}

      {/* 9. System Settings */}
      {activeTab === "settings" && (
        <CMSSettings
          language={language}
          onResetToDefaults={handleResetAllData}
          currentAdminUser={adminUser || undefined}
        />
      )}

      {/* MODAL: Add / Edit Property */}
      <CMSPropertyFormModal
        isOpen={isPropertyModalOpen}
        onClose={() => {
          setIsPropertyModalOpen(false);
          setEditingProperty(null);
        }}
        onSave={handleSaveProperty}
        initialData={editingProperty}
        language={language}
      />

      {/* MODAL: Add / Edit Project */}
      <CMSProjectFormModal
        isOpen={isProjectModalOpen}
        onClose={() => {
          setIsProjectModalOpen(false);
          setEditingProject(null);
        }}
        onSave={handleSaveProject}
        initialData={editingProject}
        language={language}
      />

      {/* MODAL: Add / Edit Blog Article */}
      <CMSBlogFormModal
        isOpen={isBlogModalOpen}
        onClose={() => {
          setIsBlogModalOpen(false);
          setEditingBlogPost(null);
        }}
        onSave={handleSaveBlogPost}
        initialData={editingBlogPost}
        language={language}
      />

      {/* MODAL: Add / Edit Client Success Story */}
      <CMSTestimonialFormModal
        isOpen={isTestimonialModalOpen}
        onClose={() => {
          setIsTestimonialModalOpen(false);
          setEditingTestimonial(null);
        }}
        onSave={handleSaveTestimonial}
        initialData={editingTestimonial}
        language={language}
      />

      {/* MODAL: Add Join List Subscriber */}
      <CMSAddSubscriberModal
        isOpen={isSubscriberModalOpen}
        onClose={() => {
          setIsSubscriberModalOpen(false);
        }}
        onSave={handleSaveSubscriber}
        language={language}
      />

      {/* MODAL: Team Member */}
      <CMSTeamFormModal
        isOpen={isTeamModalOpen}
        onClose={() => {
          setIsTeamModalOpen(false);
          setEditingTeamMember(null);
        }}
        onSave={handleSaveTeam}
        initialData={editingTeamMember}
        language={language}
      />

      {/* MODAL: FAQ */}
      <CMSFaqFormModal
        isOpen={isFaqModalOpen}
        onClose={() => {
          setIsFaqModalOpen(false);
          setEditingFaq(null);
        }}
        onSave={handleSaveFaq}
        initialData={editingFaq}
        language={language}
      />

      {/* MODAL: Office */}
      <CMSOfficeFormModal
        isOpen={isOfficeModalOpen}
        onClose={() => {
          setIsOfficeModalOpen(false);
          setEditingOffice(null);
        }}
        onSave={handleSaveOffice}
        initialData={editingOffice}
        language={language}
      />

      {/* MODAL: Certification */}
      <CMSCertificationFormModal
        isOpen={isCertModalOpen}
        onClose={() => {
          setIsCertModalOpen(false);
          setEditingCert(null);
        }}
        onSave={handleSaveCert}
        initialData={editingCert}
        language={language}
      />

      {/* MODAL: Statistic */}
      <CMSStatisticFormModal
        isOpen={isStatModalOpen}
        onClose={() => {
          setIsStatModalOpen(false);
          setEditingStat(null);
        }}
        onSave={handleSaveStat}
        initialData={editingStat}
        language={language}
      />

      {/* MODAL: Partner */}
      <CMSPartnerFormModal
        isOpen={isPartnerModalOpen}
        onClose={() => {
          setIsPartnerModalOpen(false);
          setEditingPartner(null);
        }}
        onSave={handleSavePartner}
        initialData={editingPartner}
        language={language}
      />
    </CMSLayout>
  );
};
