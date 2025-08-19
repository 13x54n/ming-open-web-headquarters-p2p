# 🔄 Transfer Flow: Frontend to Backend

## 📱 Frontend Transfer Page Flow

```mermaid
graph TD
    A[User Opens Transfer Page] --> B[ProtectedRoute Check]
    B --> C[Load Token Balances from TokenBalanceContext]
    C --> D[Load Transfer History from Backend]
    D --> E[Display Transfer Form - Step 1]
    
    E --> F[User Inputs: Recipient, Token, Amount, Memo]
    F --> G{QR Scan Button Clicked?}
    G -->|Yes| H[Open Camera Scanner]
    G -->|No| I[Manual Input]
    
    H --> J[Scan QR Code with jsQR]
    J --> K[Extract Recipient Text]
    K --> L[Auto-fill Recipient Field]
    
    I --> M[User Types Recipient]
    L --> M
    M --> N[User Selects Token]
    N --> O[User Enters Amount]
    O --> P[User Adds Memo - Optional]
    
    P --> Q[Click Continue Button]
    Q --> R[Display Transfer Summary - Step 2]
    
    R --> S[User Enters 6-Digit Security Code]
    S --> T[Click Confirm Transfer Button]
    
    T --> U[Frontend API Call: transferApi.createTransfer]
    U --> V[Backend Validation & Processing]
    V --> W[Display Success/Failure - Step 3]
    
    W --> X[Refresh Token Balances]
    X --> Y[Update Transfer History]
    Y --> Z[Return to Dashboard or Try Again]
```

## 🔌 API Integration Layer

```mermaid
graph LR
    A[Frontend Transfer Page] --> B[API Utility Layer]
    B --> C[HTTP Request Handler]
    C --> D[Backend Server: Port 4000]
    
    B --> E[transferApi.createTransfer]
    B --> F[transferApi.getUserTransfers]
    B --> G[transferApi.getTransferById]
    B --> H[transferApi.getTransferStatus]
    
    E --> I[POST /api/transfers]
    F --> J[GET /api/transfers]
    G --> K[GET /api/transfers/:id]
    H --> L[GET /api/transfers/status/:id]
    
    I --> D
    J --> D
    K --> D
    L --> D
```

## 🚀 Backend Transfer Processing

```mermaid
graph TD
    A[POST /api/transfers] --> B[Authentication Middleware]
    B --> C[authenticateUser]
    C --> D{Valid Bearer Token?}
    D -->|No| E[Return 401 Unauthorized]
    D -->|Yes| F[Validation Middleware]
    
    F --> G[validateTransfer]
    G --> H{Required Fields Present?}
    H -->|No| I[Return 400 Bad Request]
    H -->|Yes| J{Valid Format?}
    
    J -->|No| K[Return 400 Validation Error]
    J -->|Yes| L[Transfer Controller]
    
    L --> M[createTransfer Function]
    M --> N[Log Transfer Request]
    N --> O[Create Transfer Record in Database]
    O --> P[Update User Balances]
    P --> Q[Send Confirmation Email]
    Q --> R[Return Transfer Details]
    
    R --> S[Frontend Receives Response]
    S --> T[Update UI Based on Success/Failure]
```

## 📊 Data Flow Architecture

```mermaid
graph TB
    subgraph "Frontend (React/Next.js)"
        A[Transfer Form State]
        B[Token Balance Context]
        C[API Utility Functions]
        D[UI Components]
    end
    
    subgraph "API Layer"
        E[HTTP Request Handler]
        F[Authentication Headers]
        G[Error Handling]
    end
    
    subgraph "Backend (Node.js/Express)"
        H[Route Handler]
        I[Middleware Stack]
        J[Controller Functions]
        K[Database Models]
    end
    
    subgraph "Database (MongoDB)"
        L[Transfer Collection]
        M[User Collection]
        N[Token Balance Collection]
    end
    
    A --> C
    B --> C
    C --> E
    E --> F
    F --> H
    H --> I
    I --> J
    J --> K
    K --> L
    K --> M
    K --> N
    
    J --> E
    E --> D
```

## 🔐 Security & Validation Flow

```mermaid
graph TD
    A[Transfer Request] --> B[Bearer Token Extraction]
    B --> C[Token Validation]
    C --> D[User Authentication]
    
    D --> E[Input Validation]
    E --> F[Recipient Format Check]
    F --> G[Amount Validation]
    G --> H[Security Code Validation]
    H --> I[Memo Length Check]
    
    I --> J[Business Logic Validation]
    J --> K[Sufficient Balance Check]
    K --> L[Rate Limiting]
    L --> M[Transfer Processing]
    
    M --> N[Database Transaction]
    N --> O[Success Response]
    
    E --> P[Validation Error Response]
    C --> Q[Authentication Error Response]
    K --> R[Insufficient Balance Error]
```

## 📱 Mobile-Specific Features

```mermaid
graph TD
    A[Mobile Device] --> B[Responsive UI Rendering]
    B --> C[Touch-Optimized Inputs]
    
    C --> D[Amount Input Field]
    D --> E[Decimal Keyboard]
    E --> F[No Scroll Wheel Changes]
    
    C --> G[Security Code Input]
    G --> H[Numeric Keyboard]
    H --> I[Auto-focus Next Field]
    I --> J[Smart Backspace Logic]
    
    C --> K[QR Scanner]
    K --> L[Camera Access Request]
    L --> M[Back Camera Preference]
    M --> N[Real-time QR Detection]
    N --> O[Auto-fill Recipient]
    
    B --> P[Pull-to-Refresh Support]
    P --> Q[Token Balance Updates]
```

## 🔄 Error Handling & Recovery

```mermaid
graph TD
    A[API Request] --> B{Network Success?}
    B -->|No| C[Network Error Handler]
    B -->|Yes| D{HTTP Status Code}
    
    D -->|200-299| E[Success Response]
    D -->|400| F[Client Error Handler]
    D -->|401| G[Authentication Error]
    D -->|500+| H[Server Error Handler]
    
    C --> I[Show Network Error Message]
    F --> J[Show Validation Error]
    G --> K[Redirect to Login]
    H --> L[Show Server Error]
    
    I --> M[Retry Button]
    J --> N[Form Validation Display]
    K --> O[Clear Local Storage]
    L --> P[Contact Support Option]
    
    M --> A
    N --> Q[User Fixes Input]
    Q --> A
```

## 📈 Transfer Status Tracking

```mermaid
graph LR
    A[Transfer Created] --> B[Status: Pending]
    B --> C[Status: Processing]
    C --> D{Blockchain Success?}
    
    D -->|Yes| E[Status: Completed]
    D -->|No| F[Status: Failed]
    
    E --> G[Update Balances]
    F --> H[Log Error Details]
    
    G --> I[Send Success Email]
    H --> J[Send Failure Email]
    
    I --> K[Update Transfer History]
    J --> K
    
    K --> L[Frontend UI Update]
    L --> M[Real-time Status Display]
```

## 🎯 Key Integration Points

### **Frontend → Backend**
- **API Base URL**: `http://localhost:4000/api`
- **Authentication**: Bearer token in Authorization header
- **Content-Type**: `application/json`
- **Error Handling**: Structured error responses

### **Backend → Frontend**
- **Response Format**: `{success, message, data}`
- **HTTP Status Codes**: 200, 400, 401, 500
- **Real-time Updates**: Transfer status polling
- **Balance Refresh**: Automatic after successful transfers

### **Data Validation**
- **Frontend**: Basic input validation
- **Backend**: Comprehensive business logic validation
- **Database**: Schema-level constraints
- **API**: Request/response type safety

## 🚀 Performance Optimizations

- **Lazy Loading**: Transfer history pagination
- **Caching**: Token balances in context
- **Debouncing**: API calls for real-time updates
- **Error Boundaries**: Graceful error handling
- **Loading States**: User feedback during operations

---

*This flowchart represents the complete transfer flow from user input to backend processing and back to frontend updates.*
