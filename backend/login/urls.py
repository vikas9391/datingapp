from django.urls import path
from . import views

urlpatterns = [
    # ========== AUTHENTICATION ==========
    path("register/", views.RegisterView.as_view(), name="register"),
    path("login/", views.LoginView.as_view(), name="login"),
    path("google-login/", views.GoogleLoginView.as_view(), name="google-login"),
    path("google-callback/", views.GoogleCallbackView.as_view(), name="google-callback"),

    # Auth status
    path("auth/status/", views.AuthStatusView.as_view(), name="auth-status"),

    # OTP login
    path("login/send-otp/", views.SendLoginOTPView.as_view(), name="send-login-otp"),
    path("login/verify-otp/", views.VerifyLoginOTPView.as_view(), name="verify-login-otp"),

    # Email verification (post-registration)
    path("email/verify/", views.VerifyEmailOTPView.as_view(), name="verify-email-otp"),

    # ========== MATCHING ==========
    path("matches/", views.MatchRecommendationsView.as_view(), name="matches"),
    path("like/", views.LikeProfileView.as_view(), name="like-profile"),
    path("nearby/", views.NearbyUsersView.as_view(), name="nearby-users"),

    # ========== CHATS ==========
    path("chats/matched/", views.MatchedChatsView.as_view(), name="matched-chats"),
    path("chats/unread-count/", views.UnreadChatCountView.as_view(), name="chat-unread-count"),  # ← NEW
    path("chats/<str:chat_id>/messages/", views.ChatMessagesView.as_view(), name="chat-messages"),
    path("chats/<str:chat_id>/send/", views.SendChatMessageView.as_view(), name="send-message"),
    path("chats/<str:chat_id>/read/", views.MarkChatReadView.as_view(), name="mark-read"),

    # ========== USERS ==========
    path("users/block/", views.BlockUserView.as_view(), name="block-user"),
    path("users/unblock/", views.UnblockUserView.as_view(), name="unblock-user"),

    # ========== REPORTS ==========
    path("reports/", views.CreateUserReportView.as_view(), name="create-report"),

    # ========== PAYMENTS ==========
    path("create-order/", views.CreateOrderView.as_view(), name="create-order"),
    path("verify-payment/", views.VerifyPaymentView.as_view(), name="verify-payment"),

    # ========== PASSWORD RESET ==========
    path("password/forgot/", views.ForgotPasswordView.as_view(), name="forgot-password"),
    path("password/verify-otp/", views.VerifyResetOTPView.as_view(), name="verify-reset-otp"),
    path("password/reset/", views.ResetPasswordView.as_view(), name="reset-password"),

    # ========== NOTIFICATIONS ==========
    path("notifications/", views.NotificationListView.as_view(), name="notification-list"),
    path("notifications/all/", views.UserNotificationsView.as_view(), name="notification-all"),
    path("notifications/read/", views.MarkNotificationReadView.as_view(), name="notification-read"),
    path("notifications/read-all/", views.MarkAllNotificationsReadView.as_view(), name="notification-read-all"),
    path("notifications/unread-count/", views.UnreadNotificationCountView.as_view(), name="notification-unread-count"),

    # ========== PRIVACY ==========
    path("privacy/preferences/", views.PrivacyPreferencesView.as_view(), name="privacy-preferences"),
    path("privacy/export/", views.RequestDataExportView.as_view(), name="data-export"),
    path("privacy/delete-account/", views.DeleteAccountView.as_view(), name="delete-account"),

    # ========== USERS (additions) ==========
    path("users/blocked/", views.BlockedUsersListView.as_view(), name="blocked-users-list"),
]