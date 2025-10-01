import { useState, useRef, useEffect } from "react";
import { ZoomIn, ZoomOut, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import universityMapImage from "@/assets/mapaudea2.png";
interface MapNode {
  id: string;
  x: number;
  y: number;
  type: 'pass' | 'building';
  name?: string;
  category?: string;
}
interface Building {
  id: string;
  name: string;
  category: string;
  description: string;
  image: string;
  facilities: string[];
  hours: string;
  contact: string;
  rooms?: string[];
}

interface UniversityMapProps {
  route: MapNode[];
  selectedBuilding?: string;
  onBuildingClick?: (building: Building) => void;
  selectedCategory?: string;
}

// Sample buildings data with complete information
const buildingsData: Building[] = [
  {
    id: '1',
    name: 'Edificio A - Ingeniería',
    category: 'Académico',
    description: 'El Edificio A alberga las facultades de ingeniería con laboratorios modernos y aulas especializadas para diferentes ramas de la ingeniería.',
    image: 'https://images.unsplash.com/photo-1562774053-701939374585?w=800&h=600&fit=crop',
    facilities: ['Laboratorios de computación', 'Aulas especializadas', 'Biblioteca técnica', 'Cafetería', 'Wifi gratuito'],
    hours: 'Lunes a Viernes: 7:00 AM - 10:00 PM',
    contact: 'Tel: (555) 123-4567 | ingenieria@universidad.edu',
    rooms: ['A-101', 'A-102', 'A-103', 'A-201', 'A-202', 'A-301', 'Lab-A1', 'Lab-A2']
  },
  {
    id: '2',
    name: 'Biblioteca Central',
    category: 'Académico',
    description: 'La Biblioteca Central es el corazón académico del campus, ofreciendo una amplia colección de libros, recursos digitales y espacios de estudio.',
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&h=600&fit=crop',
    facilities: ['Sala de lectura silenciosa', 'Computadoras públicas', 'Salas de estudio grupal', 'Archivo digital', 'Impresión y copiado'],
    hours: 'Lunes a Domingo: 6:00 AM - 12:00 AM',
    contact: 'Tel: (555) 234-5678 | biblioteca@universidad.edu',
    rooms: ['Sala 1', 'Sala 2', 'Sala 3', 'Estudio-Grupal-1', 'Estudio-Grupal-2', 'Archivo']
  },
  {
    id: '3',
    name: 'Cafetería Principal',
    category: 'Servicios',
    description: 'La Cafetería Principal ofrece una variedad de opciones gastronómicas para toda la comunidad universitaria.',
    image: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800&h=600&fit=crop',
    facilities: ['Comida caliente y fría', 'Opciones vegetarianas', 'Área de descanso', 'Wifi gratuito', 'Máquinas expendedoras'],
    hours: 'Lunes a Viernes: 6:30 AM - 8:00 PM',
    contact: 'Tel: (555) 345-6789',
    rooms: ['Comedor Principal', 'Área VIP', 'Terraza', 'Cocina']
  },
  {
    id: '4',
    name: 'Centro Deportivo',
    category: 'Deportivo',
    description: 'Complejo deportivo con instalaciones de primera clase para el desarrollo físico y recreativo de la comunidad universitaria.',
    image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&h=600&fit=crop',
    facilities: ['Gimnasio completo', 'Piscina olímpica', 'Canchas deportivas', 'Vestidores', 'Clases grupales'],
    hours: 'Lunes a Domingo: 5:00 AM - 11:00 PM',
    contact: 'Tel: (555) 456-7890 | deportes@universidad.edu',
    rooms: ['Gimnasio-1', 'Gimnasio-2', 'Piscina', 'Cancha-Tenis', 'Cancha-Básquet', 'Sauna']
  },
  {
    id: '5',
    name: 'Auditorio Magna',
    category: 'Eventos',
    description: 'Auditorio principal para conferencias, graduaciones y eventos especiales de la universidad.',
    image: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&h=600&fit=crop',
    facilities: ['Capacidad para 500 personas', 'Sistema audiovisual', 'Aire acondicionado', 'Acceso para discapacitados'],
    hours: 'Según programación de eventos',
    contact: 'Tel: (555) 567-8901 | eventos@universidad.edu',
    rooms: ['Auditorio Principal', 'Sala de Espera', 'Camerinos', 'Cabina Técnica']
  },
  {
    id: '6',
    name: 'Edificio B - Ciencias',
    category: 'Académico',
    description: 'Dedicado a las ciencias básicas con laboratorios especializados en física, química y biología.',
    image: 'https://images.unsplash.com/photo-1532094349884-543bc11b234d?w=800&h=600&fit=crop',
    facilities: ['Laboratorios de química', 'Laboratorios de física', 'Microscopios avanzados', 'Invernadero', 'Sala de conferencias'],
    hours: 'Lunes a Viernes: 7:00 AM - 9:00 PM',
    contact: 'Tel: (555) 678-9012 | ciencias@universidad.edu',
    rooms: ['B-101', 'B-201', 'Lab-Química', 'Lab-Física', 'Lab-Biología', 'Invernadero']
  },
  {
    id: '7',
    name: 'Laboratorios',
    category: 'Académico',
    description: 'Complejo de laboratorios multidisciplinarios para investigación y prácticas académicas.',
    image: 'https://images.unsplash.com/photo-1582719471384-894fbb16e074?w=800&h=600&fit=crop',
    facilities: ['Equipos especializados', 'Microscopios electrónicos', 'Seguridad avanzada', 'Aire filtrado'],
    hours: 'Lunes a Viernes: 8:00 AM - 6:00 PM',
    contact: 'Tel: (555) 789-0123 | laboratorios@universidad.edu',
    rooms: ['Lab-Investigación-1', 'Lab-Investigación-2', 'Lab-Microscopía', 'Sala-Limpia']
  },
  {
    id: '8',
    name: 'Rectoría',
    category: 'Administrativo',
    description: 'Sede de la administración central universitaria donde se encuentran las oficinas directivas.',
    image: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800&h=600&fit=crop',
    facilities: ['Oficinas administrativas', 'Sala de juntas', 'Atención al público', 'Archivo universitario'],
    hours: 'Lunes a Viernes: 8:00 AM - 5:00 PM',
    contact: 'Tel: (555) 890-1234 | rectoria@universidad.edu',
    rooms: ['Oficina Rector', 'Sala de Juntas', 'Secretaría', 'Archivo', 'Recepción']
  }
];

// Sample nodes for the university map
const mapNodes: MapNode[] = [{
  id: '1',
  x: 200,
  y: 150,
  type: 'building',
  name: 'Edificio A - Ingeniería',
  category: 'Académico'
}, {
  id: '2',
  x: 400,
  y: 200,
  type: 'building',
  name: 'Biblioteca Central',
  category: 'Académico'
}, {
  id: '3',
  x: 600,
  y: 300,
  type: 'building',
  name: 'Cafetería Principal',
  category: 'Servicios'
}, {
  id: '4',
  x: 800,
  y: 250,
  type: 'building',
  name: 'Centro Deportivo',
  category: 'Deportivo'
}, {
  id: '5',
  x: 300,
  y: 400,
  type: 'building',
  name: 'Auditorio Magna',
  category: 'Eventos'
}, {
  id: '6',
  x: 700,
  y: 150,
  type: 'building',
  name: 'Edificio B - Ciencias',
  category: 'Académico'
}, {
  id: '7',
  x: 500,
  y: 350,
  type: 'building',
  name: 'Laboratorios',
  category: 'Académico'
}, {
  id: '8',
  x: 150,
  y: 300,
  type: 'building',
  name: 'Rectoría',
  category: 'Administrativo'
},
// Pass nodes for routing
{
  id: 'p1',
  x: 300,
  y: 175,
  type: 'pass'
}, {
  id: 'p2',
  x: 500,
  y: 250,
  type: 'pass'
}, {
  id: 'p3',
  x: 700,
  y: 275,
  type: 'pass'
}, {
  id: 'p4',
  x: 400,
  y: 350,
  type: 'pass'
}];
export const UniversityMap = ({
  route,
  selectedBuilding,
  onBuildingClick,
  selectedCategory
}: UniversityMapProps) => {
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({
    x: 0,
    y: 0
  });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({
    x: 0,
    y: 0
  });
  const mapRef = useRef<HTMLDivElement>(null);
  const handleZoomIn = () => setScale(prev => Math.min(prev + 0.2, 3));
  const handleZoomOut = () => setScale(prev => Math.max(prev - 0.2, 0.5));
  const handleReset = () => {
    setScale(1);
    setPosition({
      x: 0,
      y: 0
    });
  };
  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragStart({
      x: e.clientX - position.x,
      y: e.clientY - position.y
    });
  };
  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setPosition({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y
    });
  };
  const handleMouseUp = () => {
    setIsDragging(false);
  };
  const renderRoute = () => {
    if (route.length < 2) return null;
    const pathData = route.reduce((path, node, index) => {
      const command = index === 0 ? 'M' : 'L';
      return `${path} ${command} ${node.x * scale + position.x} ${node.y * scale + position.y}`;
    }, '');
    return <svg className="absolute inset-0 pointer-events-none z-20" style={{
      width: '100%',
      height: '100%'
    }}>
        <path d={pathData} stroke="hsl(var(--primary))" strokeWidth="4" fill="none" strokeDasharray="8,4" className="animate-pulse" />
      </svg>;
  };
  return <div className="relative w-full h-full bg-secondary overflow-hidden rounded-lg shadow-lg">
      {/* Map Controls */}
      <div className="absolute top-4 right-4 z-30 flex flex-col gap-2">
        <Button size="sm" variant="secondary" onClick={handleZoomIn} className="w-10 h-10 p-0 shadow-md">
          <ZoomIn className="h-4 w-4" />
        </Button>
        <Button size="sm" variant="secondary" onClick={handleZoomOut} className="w-10 h-10 p-0 shadow-md">
          <ZoomOut className="h-4 w-4" />
        </Button>
        <Button size="sm" variant="secondary" onClick={handleReset} className="w-10 h-10 p-0 shadow-md">
          <RotateCcw className="h-4 w-4" />
        </Button>
      </div>

      {/* Map Container */}
      <div ref={mapRef} className="relative w-full h-full cursor-grab active:cursor-grabbing" onMouseDown={handleMouseDown} onMouseMove={handleMouseMove} onMouseUp={handleMouseUp} onMouseLeave={handleMouseUp}>
        {/* Base Map Image */}
        <img src={universityMapImage} alt="University Campus Map" className="absolute inset-0 w-full h-full object-cover transition-transform duration-200" style={{
        transform: `scale(${scale}) translate(${position.x / scale}px, ${position.y / scale}px)`
      }} draggable={false} />

        {/* Category Indicators */}
        {selectedCategory && (
          <div className="absolute inset-0 z-10" style={{
            transform: `scale(${scale}) translate(${position.x / scale}px, ${position.y / scale}px)`
          }}>
            {mapNodes
              .filter(node => 
                node.type === 'building' && 
                (selectedCategory === 'all' || node.category === selectedCategory)
              )
              .map(node => (
                <div 
                  key={node.id} 
                  className="absolute flex flex-col items-center cursor-pointer transform -translate-x-1/2 -translate-y-full"
                  style={{
                    left: node.x,
                    top: node.y
                  }}
                  onClick={() => {
                    const buildingData = buildingsData.find(b => b.name === node.name);
                    if (buildingData) onBuildingClick?.(buildingData);
                  }}
                >
                  <div className="bg-primary text-primary-foreground px-2 py-1 rounded text-xs whitespace-nowrap shadow-lg mb-1">
                    {node.name}
                  </div>
                  <div className="w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-primary"></div>
                  <div className="w-3 h-3 rounded-full bg-primary border-2 border-background shadow-lg"></div>
                </div>
              ))
            }
          </div>
        )}

        {/* Route Overlay */}
        {renderRoute()}
      </div>

      {/* Map Legend */}
      
    </div>;
};