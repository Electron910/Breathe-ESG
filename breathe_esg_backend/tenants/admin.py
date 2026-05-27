from django.contrib import admin
from django.contrib.auth.hashers import make_password
from .models import Tenant, User

class CustomUserAdmin(admin.ModelAdmin):
    def save_model(self, request, obj, form, change):
        if obj.password and not obj.password.startswith('pbkdf2_'):
            obj.password = make_password(obj.password)
        super().save_model(request, obj, form, change)

admin.site.register(Tenant)
admin.site.register(User, CustomUserAdmin)
