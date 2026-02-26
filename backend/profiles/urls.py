from django.urls import path
from . import views

app_name = 'profile'

urlpatterns = [
    path('', views.get_profile, name='get_profile'),
    path('save/', views.create_or_update_profile, name='save_profile'),
    path('delete/', views.delete_profile, name='delete_profile'),
    path('status/', views.profile_status, name='profile_status'),
    path('onboarding/', views.ProfileView.as_view(), name='onboarding'),
    path('detail/<str:email>/', views.ProfileDetailView.as_view(), name='profile_detail'),

    # Swipe gate endpoints
    path('swipes/', views.get_swipe_count, name='get_swipe_count'),
    path('swipes/increment/', views.increment_swipe_count, name='increment_swipe_count'),
]