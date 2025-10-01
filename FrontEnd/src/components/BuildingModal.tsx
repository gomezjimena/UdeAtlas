import { X, Heart, Send } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { useState } from "react";

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

interface BuildingModalProps {
  building: Building | null;
  isOpen: boolean;
  onClose: () => void;
}

export const BuildingModal = ({ building, isOpen, onClose }: BuildingModalProps) => {
  const [isFavorite, setIsFavorite] = useState(false);
  const [comments, setComments] = useState([
    { id: 1, user: "Ana García", text: "Excelente lugar para estudiar, muy tranquilo.", date: "Hace 2 días" },
    { id: 2, user: "Carlos López", text: "Los laboratorios están muy bien equipados.", date: "Hace 1 semana" }
  ]);
  const [newComment, setNewComment] = useState("");

  if (!building) return null;

  const handleAddComment = () => {
    if (newComment.trim()) {
      setComments([...comments, {
        id: Date.now(),
        user: "Usuario",
        text: newComment,
        date: "Ahora"
      }]);
      setNewComment("");
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl w-[90vw] h-[85vh] p-0 overflow-hidden">
        <div className="flex flex-col h-full">
          {/* Header with close button and favorite */}
          <DialogHeader className="flex flex-row items-center justify-between p-4 border-b">
            <DialogTitle className="text-xl font-semibold text-foreground">
              {building.name}
            </DialogTitle>
            <div className="flex items-center gap-2">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setIsFavorite(!isFavorite)}
                className="h-8 w-8 p-0"
              >
                <Heart className={`h-4 w-4 ${isFavorite ? 'fill-red-500 text-red-500' : ''}`} />
              </Button>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={onClose}
                className="h-8 w-8 p-0"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </DialogHeader>

          {/* Image section - reduced size */}
          <div className="h-48 relative">
            <img 
              src={building.image} 
              alt={building.name}
              className="w-full h-full object-cover"
            />
            <div className="absolute top-4 left-4">
              <span className="bg-primary text-primary-foreground px-3 py-1 rounded-full text-sm font-medium">
                {building.category}
              </span>
            </div>
          </div>

          {/* Scrollable content section */}
          <ScrollArea className="flex-1">
            <div className="p-6 space-y-6">
              {/* Description */}
              <Card className="p-4">
                <h3 className="font-semibold mb-2 text-foreground">Descripción</h3>
                <p className="text-muted-foreground leading-relaxed">
                  {building.description}
                </p>
              </Card>

              {/* Rooms Section */}
              {building.rooms && building.rooms.length > 0 && (
                <Card className="p-4">
                  <h3 className="font-semibold mb-3 text-foreground">Salones Disponibles</h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    {building.rooms.map((room, index) => (
                      <div key={index} className="bg-muted text-muted-foreground px-3 py-2 rounded-md text-sm text-center">
                        {room}
                      </div>
                    ))}
                  </div>
                </Card>
              )}

              {/* Facilities and Details Grid */}
              <div className="grid md:grid-cols-2 gap-4">
                {/* Facilities */}
                <Card className="p-4">
                  <h3 className="font-semibold mb-3 text-foreground">Servicios y Facilities</h3>
                  <ul className="space-y-2">
                    {building.facilities.map((facility, index) => (
                      <li key={index} className="flex items-center text-sm text-muted-foreground">
                        <div className="w-2 h-2 bg-primary rounded-full mr-2" />
                        {facility}
                      </li>
                    ))}
                  </ul>
                </Card>

                {/* Contact and Hours */}
                <Card className="p-4">
                  <h3 className="font-semibold mb-3 text-foreground">Información de Contacto</h3>
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm font-medium text-foreground">Horarios</p>
                      <p className="text-sm text-muted-foreground">{building.hours}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground">Contacto</p>
                      <p className="text-sm text-muted-foreground">{building.contact}</p>
                    </div>
                  </div>
                </Card>
              </div>

              {/* Comments Section */}
              <Card className="p-4">
                <h3 className="font-semibold mb-4 text-foreground">Comentarios</h3>
                
                {/* Add new comment */}
                <div className="flex gap-2 mb-4">
                  <Input
                    placeholder="Agregar un comentario..."
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleAddComment()}
                    className="flex-1"
                  />
                  <Button 
                    onClick={handleAddComment}
                    size="sm"
                    disabled={!newComment.trim()}
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </div>

                {/* Comments list */}
                <div className="space-y-4">
                  {comments.map((comment) => (
                    <div key={comment.id} className="border-l-2 border-primary/20 pl-4">
                      <div className="flex items-center justify-between mb-1">
                        <p className="font-medium text-sm text-foreground">{comment.user}</p>
                        <p className="text-xs text-muted-foreground">{comment.date}</p>
                      </div>
                      <p className="text-sm text-muted-foreground">{comment.text}</p>
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          </ScrollArea>
        </div>
      </DialogContent>
    </Dialog>
  );
};