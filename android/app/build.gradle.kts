plugins {
    id("com.android.application")
    id("kotlin-android")
    id("dev.flutter.flutter-gradle-plugin")
}

android {
    namespace = "com.mosafer.app"
    compileSdk = 34
    ndkVersion = flutter.ndkVersion

    compileOptions {
        sourceCompatibility = JavaVersion.VERSION_17
        targetCompatibility = JavaVersion.VERSION_17
    }

    kotlinOptions {
        jvmTarget = JavaVersion.VERSION_17.toString()
    }

    defaultConfig {
        // مُعرِّف التطبيق - لازم يتطابق مع اللي هتسجله في Firebase Console
        applicationId = "com.mosafer.app"
        minSdk = 23
        targetSdk = 34
        versionCode = flutter.versionCode
        versionName = flutter.versionName
        multiDexEnabled = true
    }

    buildTypes {
        release {
            // مؤقتًا بنوقّع بمفتاح التجربة (debug) عشان تقدر تبني وتجرب على طول.
            // قبل أي نشر فعلي على المتجر، لازم تعمل مفتاح توقيع خاص بيك
            // (راجع: https://docs.flutter.dev/deployment/android#signing-the-app)
            signingConfig = signingConfigs.getByName("debug")
        }
    }
}

flutter {
    source = "../.."
}

dependencies {
    implementation("androidx.multidex:multidex:2.0.1")
}
