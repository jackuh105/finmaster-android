# FinMaster ProGuard Rules
-keepattributes Signature
-keepattributes *Annotation*

# Retrofit
-keep class com.finmaster.data.remote.dto.** { *; }
-keep,allowobfuscation,allowshrinking interface retrofit2.Call
-keep,allowobfuscation,allowshrinking class kotlinx.serialization.** { *; }

# Room
-keep class * extends androidx.room.RoomDatabase

# Supabase
-keep class io.github.jan.supabase.** { *; }

# Apache POI
-keep class org.apache.poi.** { *; }
-dontwarn org.apache.poi.**
