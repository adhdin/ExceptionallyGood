import type { ErrorEntry } from '../types/error';

type Seed = Omit<ErrorEntry, 'id'> & { id?: string };

const seeds: Seed[] = [
  {
    title: 'CORS blockt alles – Frontend ghostet das Backend',
    errorMessage: `Access to fetch at 'http://localhost:8080/api/v1/workouts' from origin 'http://localhost:5173' has been blocked by CORS policy: Response to preflight request doesn't pass access control check: No 'Access-Control-Allow-Origin' header is present on the requested resource.`,
    projectName: 'GymBuddy Tracker',
    language: 'Java',
    framework: 'Spring Boot',
    category: 'CORS Error',
    cause: 'Spring Security hat den OPTIONS-Preflight abgefangen, bevor überhaupt eine CORS-Config gegriffen hat. Die @CrossOrigin-Annotation am Controller war komplett useless, weil die Security-Filterchain vorher zuschlägt.',
    solution: 'CORS zentral in der SecurityFilterChain aktivieren (http.cors(Customizer.withDefaults())) und eine CorsConfigurationSource-Bean mit dem Vite-Origin bereitstellen. Danach läuft der Preflight sauber durch.',
    codeSnippet: `@Bean
SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
    http.cors(Customizer.withDefaults())
        .csrf(csrf -> csrf.disable())
        .authorizeHttpRequests(auth -> auth.anyRequest().authenticated());
    return http.build();
}

@Bean
CorsConfigurationSource corsConfigurationSource() {
    CorsConfiguration config = new CorsConfiguration();
    config.setAllowedOrigins(List.of("http://localhost:5173"));
    config.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "OPTIONS"));
    config.setAllowedHeaders(List.of("*"));
    config.setAllowCredentials(true);
    UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
    source.registerCorsConfiguration("/**", config);
    return source;
}`,
    notes: 'Für Prod die Origins aus application.yml ziehen, nicht hardcoden. Lowkey der Klassiker schlechthin.',
    tags: ['cors', 'spring-security', 'preflight'],
    isFavorite: true,
    createdAt: '2024-09-04T09:12:00.000Z',
    updatedAt: '2025-02-11T16:40:00.000Z',
  },
  {
    title: 'Cannot read properties of undefined (map) – API-Response noch nicht da',
    errorMessage: `Uncaught TypeError: Cannot read properties of undefined (reading 'map')
    at WorkoutList (WorkoutList.tsx:23:22)
    at renderWithHooks (react-dom.development.js:16305:18)
    at mountIndeterminateComponent (react-dom.development.js:20074:13)`,
    projectName: 'GymBuddy Tracker',
    language: 'TypeScript',
    framework: 'React',
    category: 'TypeError',
    cause: 'Der State war initial undefined, und beim ersten Render wurde direkt .map() aufgerufen, bevor der Fetch durch war. Classic Race beim Initial Render.',
    solution: 'State mit leerem Array initialisieren und zusätzlich Loading-State rendern. Optional Chaining als Safety Net.',
    codeSnippet: `const [workouts, setWorkouts] = useState<Workout[]>([]);
const [loading, setLoading] = useState(true);

useEffect(() => {
  api.getWorkouts()
    .then(setWorkouts)
    .finally(() => setLoading(false));
}, []);

if (loading) return <Spinner />;
return <ul>{workouts?.map((w) => <WorkoutItem key={w.id} workout={w} />)}</ul>;`,
    notes: 'TypeScript hätte das gecatcht, wenn ich den useState nicht mit "any" getyped hätte. Skill issue, ngl.',
    tags: ['useState', 'fetch', 'undefined'],
    isFavorite: false,
    createdAt: '2024-09-18T14:03:00.000Z',
    updatedAt: '2024-09-18T14:03:00.000Z',
  },
  {
    title: 'LazyInitializationException beim Laden der Orders',
    errorMessage: `org.hibernate.LazyInitializationException: failed to lazily initialize a collection of role: com.snackdrop.order.Order.items: could not initialize proxy - no Session
	at org.hibernate.collection.spi.AbstractPersistentCollection.throwLazyInitializationException(AbstractPersistentCollection.java:635)
	at org.hibernate.collection.spi.AbstractPersistentCollection.withTemporarySessionIfNeeded(AbstractPersistentCollection.java:218)`,
    projectName: 'SnackDrop Backend',
    language: 'Java',
    framework: 'Spring Boot',
    category: 'Hibernate / JPA',
    cause: 'Die Entity wurde direkt aus dem Controller als JSON serialisiert. Jackson greift auf die lazy Collection zu, nachdem die Transaktion schon geschlossen war (open-in-view war deaktiviert).',
    solution: 'Statt Entities DTOs zurückgeben und die Items im Repository per JOIN FETCH bzw. @EntityGraph laden. Mapping passiert innerhalb der @Transactional Service-Methode.',
    codeSnippet: `public interface OrderRepository extends JpaRepository<Order, Long> {

    @EntityGraph(attributePaths = "items")
    Optional<Order> findWithItemsById(Long id);
}

@Transactional(readOnly = true)
public OrderDto getOrder(Long id) {
    return orderRepository.findWithItemsById(id)
        .map(OrderMapper::toDto)
        .orElseThrow(() -> new OrderNotFoundException(id));
}`,
    notes: 'Bitte NICHT spring.jpa.open-in-view=true als "Fix" nehmen. Das ist kein Fix, das ist Cope.',
    tags: ['hibernate', 'jpa', 'lazy-loading', 'dto'],
    isFavorite: true,
    createdAt: '2024-10-02T08:45:00.000Z',
    updatedAt: '2024-10-03T10:20:00.000Z',
  },
  {
    title: 'Too many re-renders – useEffect-Loop of doom',
    errorMessage: `Error: Too many re-renders. React limits the number of renders to prevent an infinite loop.`,
    projectName: 'VibeCheck Dashboard',
    language: 'TypeScript',
    framework: 'React',
    category: 'Runtime Error',
    cause: 'setState wurde direkt im Render-Body aufgerufen (onClick={setOpen(true)} statt Arrow-Function). Jeder Render hat sofort den nächsten getriggert.',
    solution: 'Event-Handler als Funktion übergeben: onClick={() => setOpen(true)}. Kein setState im Render-Body.',
    codeSnippet: `// ❌ ruft setOpen bei jedem Render auf
<button onClick={setOpen(true)}>Öffnen</button>

// ✅ übergibt eine Funktion
<button onClick={() => setOpen(true)}>Öffnen</button>`,
    notes: 'Hat mich 40 Minuten gekostet. Fr fr.',
    tags: ['re-render', 'event-handler', 'infinite-loop'],
    isFavorite: false,
    createdAt: '2024-10-21T19:30:00.000Z',
    updatedAt: '2024-10-21T19:30:00.000Z',
  },
  {
    title: 'Bean konnte nicht erstellt werden – zirkuläre Abhängigkeit',
    errorMessage: `***************************
APPLICATION FAILED TO START
***************************

Description:

The dependencies of some of the beans in the application context form a cycle:

┌─────┐
|  userService defined in file [UserService.class]
↑     ↓
|  notificationService defined in file [NotificationService.class]
└─────┘

Action:

Relying upon circular references is discouraged and they are prohibited by default.`,
    projectName: 'StudyBuddy API',
    language: 'Java',
    framework: 'Spring Boot',
    category: 'BeanCreationException',
    cause: 'UserService injiziert NotificationService und umgekehrt. Seit Spring Boot 2.6 sind zirkuläre Referenzen standardmäßig verboten.',
    solution: 'Verantwortlichkeiten entkoppeln: NotificationService feuert jetzt ein ApplicationEvent, UserService hört mit @EventListener darauf. Keine gegenseitige Injection mehr.',
    codeSnippet: `public record UserRegisteredEvent(Long userId, String email) {}

@Service
@RequiredArgsConstructor
public class UserService {
    private final ApplicationEventPublisher events;

    public User register(RegisterRequest req) {
        User user = userRepository.save(User.from(req));
        events.publishEvent(new UserRegisteredEvent(user.getId(), user.getEmail()));
        return user;
    }
}

@Component
class NotificationListener {
    @EventListener
    void on(UserRegisteredEvent e) { /* Mail senden */ }
}`,
    notes: '@Lazy hätte auch funktioniert, wäre aber nur Pflaster auf schlechtes Design.',
    tags: ['dependency-injection', 'circular-dependency', 'events'],
    isFavorite: false,
    createdAt: '2024-11-07T11:15:00.000Z',
    updatedAt: '2024-11-08T09:00:00.000Z',
  },
  {
    title: 'Formular resettet sich random beim Tippen',
    errorMessage: 'Kein Error in der Console. Beim Tippen im Profil-Formular springt der Cursor raus und das Input verliert den Fokus nach jedem Buchstaben. Vibe ist komplett off.',
    projectName: 'StudyBuddy Web',
    language: 'TypeScript',
    framework: 'React',
    category: 'UI Bug',
    cause: 'Die Input-Komponente wurde innerhalb der Parent-Komponente definiert. Bei jedem Render entsteht ein neuer Komponententyp → React unmountet und mountet das Input neu → Fokus weg.',
    solution: 'Komponente außerhalb der Parent-Komponente definieren (eigene Datei oder Top-Level im Modul).',
    codeSnippet: `// ❌ wird bei jedem Render neu erstellt
function ProfileForm() {
  const Field = (props: FieldProps) => <input {...props} />;
  return <Field value={name} onChange={...} />;
}

// ✅ stabiler Komponententyp
const Field = (props: FieldProps) => <input {...props} />;
function ProfileForm() {
  return <Field value={name} onChange={...} />;
}`,
    notes: 'Kein Errorcode, aber mega nervig. Merken: keine Komponenten in Komponenten definieren.',
    tags: ['focus', 'forms', 'remount', 'kein-errorcode'],
    isFavorite: true,
    createdAt: '2024-11-26T16:48:00.000Z',
    updatedAt: '2025-01-14T12:05:00.000Z',
  },
  {
    title: 'JSON parse error – LocalDate kommt nicht an',
    errorMessage: `org.springframework.http.converter.HttpMessageNotReadableException: JSON parse error: Cannot deserialize value of type \`java.time.LocalDate\` from String "24.12.2024": Failed to deserialize java.time.LocalDate: (java.time.format.DateTimeParseException) Text '24.12.2024' could not be parsed at index 0`,
    projectName: 'EventHub REST API',
    language: 'Java',
    framework: 'Spring Boot',
    category: 'HttpMessageNotReadableException',
    cause: 'Das React-Frontend hat das Datum im deutschen Format (dd.MM.yyyy) geschickt, Jackson erwartet aber ISO-8601 (yyyy-MM-dd).',
    solution: 'Im Frontend das Datum vor dem Senden als ISO-String formatieren. Zusätzlich im Backend einen globalen @ControllerAdvice-Handler, der eine verständliche 400-Response liefert.',
    codeSnippet: `// Frontend
const payload = { ...form, eventDate: format(form.eventDate, 'yyyy-MM-dd') };

// Backend
@ExceptionHandler(HttpMessageNotReadableException.class)
ResponseEntity<ApiError> handleUnreadable(HttpMessageNotReadableException ex) {
    return ResponseEntity.badRequest()
        .body(new ApiError("INVALID_BODY", "Request-Body ist ungültig – Datum im Format yyyy-MM-dd senden."));
}`,
    notes: 'Contract zwischen FE und BE dokumentieren (OpenAPI). Sonst passiert das wieder.',
    tags: ['jackson', 'localdate', 'datum', 'validation'],
    isFavorite: false,
    createdAt: '2024-12-19T10:22:00.000Z',
    updatedAt: '2024-12-19T10:22:00.000Z',
  },
  {
    title: 'Hydration failed – Server und Client sind nicht im selben Vibe',
    errorMessage: `Error: Hydration failed because the initial UI does not match what was rendered on the server.
Warning: Expected server HTML to contain a matching <div> in <p>.`,
    projectName: 'Portfolio Website',
    language: 'TypeScript',
    framework: 'React',
    category: 'Hydration Error',
    cause: 'Ein <div> war innerhalb eines <p> verschachtelt (ungültiges HTML). Der Browser korrigiert das DOM, wodurch es nicht mehr zum gerenderten Markup passt. Zusätzlich wurde new Date() direkt im Render benutzt.',
    solution: 'HTML-Struktur fixen (<p> → <div>) und zeitabhängige Werte erst in useEffect nach dem Mount setzen.',
    codeSnippet: `const [now, setNow] = useState<string | null>(null);
useEffect(() => setNow(new Date().toLocaleTimeString()), []);

return <div className="hero">{now ?? '…'}</div>;`,
    notes: '',
    tags: ['ssr', 'hydration', 'html'],
    isFavorite: false,
    createdAt: '2025-01-09T13:10:00.000Z',
    updatedAt: '2025-01-09T13:10:00.000Z',
  },
  {
    title: '401 bei jedem Request trotz gültigem JWT',
    errorMessage: `GET http://localhost:8080/api/v1/me 401 (Unauthorized)
WWW-Authenticate: Bearer error="invalid_token", error_description="An error occurred while attempting to decode the Jwt: Signed JWT rejected: Invalid signature"`,
    projectName: 'SnackDrop Backend',
    language: 'Java',
    framework: 'Spring Security',
    category: 'Authentication Error',
    cause: 'Der Auth-Service und die Resource-API hatten unterschiedliche Secrets in der application-dev.yml. Copy-Paste-Fail beim Aufsetzen des zweiten Profils.',
    solution: 'Secret zentral über Environment-Variable JWT_SECRET setzen und in beiden Services per ${JWT_SECRET} referenzieren. Danach Token neu generieren.',
    codeSnippet: `security:
  jwt:
    secret: \${JWT_SECRET}
    expiration-minutes: 60`,
    notes: 'Mit jwt.io die Signatur gegenchecken spart viel Zeit. Secrets niemals committen, no cap.',
    tags: ['jwt', 'auth', '401', 'config'],
    isFavorite: true,
    createdAt: '2025-02-03T08:30:00.000Z',
    updatedAt: '2025-02-03T08:30:00.000Z',
  },
  {
    title: 'Each child in a list should have a unique "key" prop',
    errorMessage: `Warning: Each child in a list should have a unique "key" prop.

Check the render method of \`PlaylistView\`. See https://reactjs.org/link/warning-keys for more information.`,
    projectName: 'Lofi Playlist Generator',
    language: 'TypeScript',
    framework: 'React',
    category: 'React Warning',
    cause: 'Index als key genutzt, und beim Sortieren/Löschen der Songs wurden falsche Items wiederverwendet. Die Warning kam, weil an einer Stelle der key komplett gefehlt hat.',
    solution: 'Stabile, eindeutige IDs aus den Daten (song.id) als key verwenden – niemals den Array-Index, wenn sich die Liste ändern kann.',
    codeSnippet: `{songs.map((song) => (
  <SongRow key={song.id} song={song} onRemove={removeSong} />
))}`,
    notes: '',
    tags: ['keys', 'lists', 'warning'],
    isFavorite: false,
    createdAt: '2025-03-12T17:55:00.000Z',
    updatedAt: '2025-03-12T17:55:00.000Z',
  },
  {
    title: 'Validation läuft nicht – @Valid wird komplett ignoriert',
    errorMessage: 'Kein Fehler, kein 400. Leere Strings und negative Preise landen einfach in der Datenbank, obwohl @NotBlank und @Positive am DTO stehen. Das Backend ist einfach zu chill.',
    projectName: 'SnackDrop Backend',
    language: 'Java',
    framework: 'Spring Boot',
    category: 'Validation',
    cause: 'spring-boot-starter-validation fehlte in der pom.xml (seit Boot 2.3 nicht mehr in web enthalten) und @Valid stand nicht am @RequestBody-Parameter.',
    solution: 'Dependency hinzufügen und @Valid vor @RequestBody setzen. Fehler mit MethodArgumentNotValidException-Handler als sauberes JSON zurückgeben.',
    codeSnippet: `<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-validation</artifactId>
</dependency>

@PostMapping
public ResponseEntity<ProductDto> create(@Valid @RequestBody CreateProductRequest req) {
    return ResponseEntity.status(HttpStatus.CREATED).body(productService.create(req));
}`,
    notes: 'Silent Fails sind die schlimmsten. Immer einen Test für ungültige Requests schreiben.',
    tags: ['bean-validation', 'dto', 'kein-errorcode'],
    isFavorite: false,
    createdAt: '2025-04-01T09:40:00.000Z',
    updatedAt: '2025-04-02T14:10:00.000Z',
  },
  {
    title: "Can't perform a React state update on an unmounted component",
    errorMessage: `Warning: Can't perform a React state update on an unmounted component. This is a no-op, but it indicates a memory leak in your application. To fix, cancel all subscriptions and asynchronous tasks in a useEffect cleanup function.`,
    projectName: 'VibeCheck Dashboard',
    language: 'TypeScript',
    framework: 'React',
    category: 'Memory Leak',
    cause: 'Fetch lief weiter, nachdem der User schon weg navigiert war. Danach wurde setState auf der unmounted Komponente gecallt.',
    solution: 'AbortController im useEffect nutzen und im Cleanup abort() aufrufen. AbortError im catch ignorieren.',
    codeSnippet: `useEffect(() => {
  const controller = new AbortController();
  fetch(\`/api/moods/\${userId}\`, { signal: controller.signal })
    .then((r) => r.json())
    .then(setMoods)
    .catch((err) => {
      if (err.name !== 'AbortError') setError(err);
    });
  return () => controller.abort();
}, [userId]);`,
    notes: 'Später auf TanStack Query migrieren, dann ist das Thema eh gegessen.',
    tags: ['useEffect', 'abortcontroller', 'cleanup'],
    isFavorite: false,
    createdAt: '2025-05-06T20:15:00.000Z',
    updatedAt: '2025-05-06T20:15:00.000Z',
  },
  {
    title: 'Port 8080 already in use – Backend startet nicht',
    errorMessage: `***************************
APPLICATION FAILED TO START
***************************

Description:

Web server failed to start. Port 8080 was already in use.

Action:

Identify and stop the process that's listening on port 8080 or configure this application to listen on another port.`,
    projectName: 'EventHub REST API',
    language: 'Java',
    framework: 'Spring Boot',
    category: 'Startup Error',
    cause: 'Eine alte Instanz lief noch im Hintergrund, weil IntelliJ den Prozess beim Stoppen nicht sauber gekillt hatte.',
    solution: 'Prozess auf dem Port finden und beenden (lsof/netstat). Alternativ server.port in application-dev.yml ändern.',
    codeSnippet: `# macOS / Linux
lsof -i :8080
kill -9 <PID>

# Windows
netstat -ano | findstr :8080
taskkill /PID <PID> /F`,
    notes: 'Quick Fix, aber kommt gefühlt jede Woche. Deshalb Favorit.',
    tags: ['port', 'startup', 'devops'],
    isFavorite: true,
    createdAt: '2025-06-10T07:58:00.000Z',
    updatedAt: '2025-06-10T07:58:00.000Z',
  },
  {
    title: 'Dark-Mode-Toggle flackert beim Reload',
    errorMessage: 'Beim Neuladen der Seite blitzt kurz der Light Mode auf, bevor der Dark Mode greift. Kein Fehler in der Console, aber sieht absolut cringe aus.',
    projectName: 'Portfolio Website',
    language: 'TypeScript',
    framework: 'React',
    category: 'UI Bug',
    cause: 'Das Theme wurde erst in einem useEffect nach dem ersten Paint aus dem localStorage gelesen und gesetzt (FOUC – Flash of Unstyled Content).',
    solution: 'Ein kleines Inline-Script im <head> der index.html, das die dark-Klasse vor dem ersten Paint setzt. React übernimmt danach nur noch den aktuellen Zustand.',
    codeSnippet: `<script>
  try {
    const t = localStorage.getItem('theme');
    if (t === 'dark' || (!t && matchMedia('(prefers-color-scheme: dark)').matches)) {
      document.documentElement.classList.add('dark');
    }
  } catch {}
</script>`,
    notes: 'Genau so ist es auch hier im ErrorVault gelöst 😎',
    tags: ['dark-mode', 'fouc', 'tailwind', 'kein-errorcode'],
    isFavorite: false,
    createdAt: '2025-07-15T18:20:00.000Z',
    updatedAt: '2025-07-15T18:20:00.000Z',
  },
  {
    title: 'DataIntegrityViolation – doppelte E-Mail bei Registrierung',
    errorMessage: `org.springframework.dao.DataIntegrityViolationException: could not execute statement [ERROR: duplicate key value violates unique constraint "uk_users_email"
  Detail: Key (email)=(lena@example.com) already exists.] [insert into users (created_at,email,password_hash,id) values (?,?,?,?)]; SQL [insert into users ...]; constraint [uk_users_email]`,
    projectName: 'StudyBuddy API',
    language: 'Java',
    framework: 'Spring Boot',
    category: 'DataIntegrityViolationException',
    cause: 'Kein Check vor dem Insert, ob die E-Mail schon existiert. Die DB-Exception ist als 500 im Frontend gelandet.',
    solution: 'Vorab existsByEmailIgnoreCase() prüfen und eine eigene EmailAlreadyTakenException werfen, die per @ControllerAdvice als 409 Conflict zurückgegeben wird. DB-Constraint bleibt als Safety Net für Race Conditions.',
    codeSnippet: `if (userRepository.existsByEmailIgnoreCase(req.email())) {
    throw new EmailAlreadyTakenException(req.email());
}

@ExceptionHandler(EmailAlreadyTakenException.class)
@ResponseStatus(HttpStatus.CONFLICT)
ApiError handleEmailTaken(EmailAlreadyTakenException ex) {
    return new ApiError("EMAIL_TAKEN", "Diese E-Mail ist bereits registriert.");
}`,
    notes: 'Frontend zeigt jetzt die Message direkt unter dem E-Mail-Feld. UX ist chef\'s kiss.',
    tags: ['postgres', 'unique-constraint', '409', 'controller-advice'],
    isFavorite: false,
    createdAt: '2025-08-22T12:00:00.000Z',
    updatedAt: '2025-08-23T09:30:00.000Z',
  },
  {
    title: 'Objects are not valid as a React child',
    errorMessage: `Error: Objects are not valid as a React child (found: object with keys {code, message, timestamp}). If you meant to render a collection of children, use an array instead.`,
    projectName: 'EventHub Frontend',
    language: 'TypeScript',
    framework: 'React',
    category: 'Runtime Error',
    cause: 'Das komplette ApiError-Objekt vom Spring-Backend wurde direkt in JSX gerendert ({error}) statt nur error.message.',
    solution: 'Nur den String rendern und den Error-Typ im API-Client sauber typisieren.',
    codeSnippet: `type ApiError = { code: string; message: string; timestamp: string };

{error && <p className="text-red-500">{error.message}</p>}`,
    notes: '',
    tags: ['jsx', 'error-handling', 'typing'],
    isFavorite: false,
    createdAt: '2025-09-05T15:35:00.000Z',
    updatedAt: '2025-09-05T15:35:00.000Z',
  },
  {
    title: 'Vite Env-Variablen sind undefined',
    errorMessage: `GET http://localhost:5173/undefined/api/v1/events 404 (Not Found)`,
    projectName: 'EventHub Frontend',
    language: 'TypeScript',
    framework: 'Vite',
    category: 'Configuration',
    cause: 'Die Variable hieß API_URL statt VITE_API_URL. Vite exposed nur Variablen mit VITE_-Prefix an den Client. Außerdem wurde der Dev-Server nach dem Ändern der .env nicht neu gestartet.',
    solution: 'Variable in VITE_API_URL umbenennen, per import.meta.env.VITE_API_URL lesen und Dev-Server neu starten.',
    codeSnippet: `# .env.local
VITE_API_URL=http://localhost:8080

// api.ts
const BASE_URL = import.meta.env.VITE_API_URL;
if (!BASE_URL) throw new Error('VITE_API_URL ist nicht gesetzt');`,
    notes: 'Kein process.env in Vite, das ist CRA-Brainrot.',
    tags: ['vite', 'env', 'config'],
    isFavorite: false,
    createdAt: '2025-10-08T10:10:00.000Z',
    updatedAt: '2025-10-08T10:10:00.000Z',
  },
  {
    title: 'Pagination liefert doppelte Einträge',
    errorMessage: 'Beim Durchblättern der Event-Liste tauchen manche Events auf Seite 2 und 3 doppelt auf, andere fehlen komplett. Kein Error, nur sus Daten.',
    projectName: 'EventHub REST API',
    language: 'Java',
    framework: 'Spring Data JPA',
    category: 'Logic Error',
    cause: 'Sortierung nur nach startDate, und viele Events haben dasselbe Datum. Ohne eindeutigen Tiebreaker ist die Reihenfolge in Postgres nicht deterministisch.',
    solution: 'Sekundäre Sortierung nach id hinzufügen, damit die Reihenfolge stabil ist.',
    codeSnippet: `Pageable pageable = PageRequest.of(page, size,
    Sort.by("startDate").ascending().and(Sort.by("id").ascending()));
return eventRepository.findAll(pageable).map(EventMapper::toDto);`,
    notes: 'Für sehr große Tabellen später auf Keyset-Pagination umstellen.',
    tags: ['pagination', 'sorting', 'postgres', 'kein-errorcode'],
    isFavorite: true,
    createdAt: '2025-11-03T13:25:00.000Z',
    updatedAt: '2025-11-20T08:15:00.000Z',
  },
  {
    title: 'useNavigate() may be used only in the context of a <Router>',
    errorMessage: `Error: useNavigate() may be used only in the context of a <Router> component.
    at invariant (react-router/dist/index.js:211:11)
    at useNavigateUnstable (react-router/dist/index.js:4312:3)
    at AuthProvider (AuthProvider.tsx:14:20)`,
    projectName: 'GymBuddy Tracker',
    language: 'TypeScript',
    framework: 'React Router',
    category: 'Runtime Error',
    cause: 'Der AuthProvider (der useNavigate nutzt) war in main.tsx außerhalb von <BrowserRouter> gewrappt.',
    solution: 'Reihenfolge der Provider tauschen: BrowserRouter ganz außen, AuthProvider innerhalb.',
    codeSnippet: `createRoot(document.getElementById('root')!).render(
  <BrowserRouter>
    <AuthProvider>
      <App />
    </AuthProvider>
  </BrowserRouter>,
);`,
    notes: '',
    tags: ['react-router', 'provider', 'context'],
    isFavorite: false,
    createdAt: '2025-11-27T21:05:00.000Z',
    updatedAt: '2025-11-27T21:05:00.000Z',
  },
  {
    title: 'Upload bricht ab – MaxUploadSizeExceeded',
    errorMessage: `org.springframework.web.multipart.MaxUploadSizeExceededException: Maximum upload size exceeded
	Caused by: org.apache.tomcat.util.http.fileupload.impl.FileSizeLimitExceededException: The field file exceeds its maximum permitted size of 1048576 bytes.`,
    projectName: 'GymBuddy Tracker',
    language: 'Java',
    framework: 'Spring Boot',
    category: 'MaxUploadSizeExceededException',
    cause: 'Spring Boot erlaubt standardmäßig nur 1 MB pro Datei. Die Progress-Fotos vom Handy sind locker 4–6 MB.',
    solution: 'Limits in application.yml hochsetzen und im Frontend vor dem Upload clientseitig prüfen bzw. Bilder komprimieren. Zusätzlich 413-Handler im Backend.',
    codeSnippet: `spring:
  servlet:
    multipart:
      max-file-size: 10MB
      max-request-size: 12MB`,
    notes: 'Clientseitige Kompression mit browser-image-compression war der Gamechanger.',
    tags: ['upload', 'multipart', 'config', '413'],
    isFavorite: false,
    createdAt: '2025-12-09T16:40:00.000Z',
    updatedAt: '2025-12-09T16:40:00.000Z',
  },
  {
    title: 'Stale State im Interval – Timer zählt nicht weiter',
    errorMessage: 'Der Pomodoro-Timer bleibt bei 24:59 hängen. Keine Fehlermeldung, setInterval läuft, aber der angezeigte Wert ändert sich nur einmal. Main-Character-Energy hat der Timer jedenfalls nicht.',
    projectName: 'StudyBuddy Web',
    language: 'TypeScript',
    framework: 'React',
    category: 'Logic Error',
    cause: 'Stale Closure: Der Callback in setInterval hat den initialen State-Wert eingefangen, weil der useEffect ein leeres Dependency-Array hatte.',
    solution: 'Functional Update verwenden (setSeconds(s => s - 1)), damit immer der aktuelle Wert genutzt wird. Interval im Cleanup clearen.',
    codeSnippet: `useEffect(() => {
  if (!running) return;
  const id = setInterval(() => setSeconds((s) => Math.max(0, s - 1)), 1000);
  return () => clearInterval(id);
}, [running]);`,
    notes: 'Stale Closures sind so ein unterschätzter Endgegner.',
    tags: ['closure', 'setInterval', 'hooks', 'kein-errorcode'],
    isFavorite: false,
    createdAt: '2025-12-18T09:05:00.000Z',
    updatedAt: '2025-12-18T09:05:00.000Z',
  },
];

export function getSeedEntries(): ErrorEntry[] {
  return seeds.map((s, i) => ({ ...s, id: s.id ?? `seed-${String(i + 1).padStart(3, '0')}` }));
}
