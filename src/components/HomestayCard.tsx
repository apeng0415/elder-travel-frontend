import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Star, MapPin } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function HomestayCard({
  homestay,
  highlightReason,
}: {
  homestay: any;
  highlightReason?: string;
  compact?: boolean;
}) {
  const navigate = useNavigate();

  return (
    <Card
      className="overflow-hidden hover:shadow-lg transition cursor-pointer"
      onClick={() => navigate(`/elder/homestays/${homestay.id}`)}
    >
      {homestay.image_url && (
        <img
          src={homestay.image_url}
          alt={homestay.name}
          className="w-full h-44 object-cover"
        />
      )}
      <CardContent className="p-4 space-y-2">
        {highlightReason && (
          <div className="text-sm text-orange-600 font-medium">{highlightReason}</div>
        )}
        <div className="text-lg font-semibold">{homestay.name}</div>
        <div className="flex items-center gap-3 text-base text-muted-foreground">
          <span className="flex items-center gap-1">
            <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
            {homestay.rating}
          </span>
          {homestay.district && (
            <span className="flex items-center gap-1">
              <MapPin className="h-4 w-4" />
              {homestay.district}
            </span>
          )}
        </div>
        <div className="text-orange-600 font-bold text-lg">
          ¥{homestay.price}
          <span className="text-sm text-muted-foreground font-normal">/晚</span>
        </div>
        {homestay.description && (
          <div className="text-base text-muted-foreground line-clamp-2">
            {homestay.description}
          </div>
        )}
        <div className="flex flex-wrap gap-1 pt-1">
          {homestay.has_elevator && <Badge variant="secondary">电梯便利</Badge>}
          {homestay.near_hospital && <Badge variant="secondary">近医院</Badge>}
        </div>
      </CardContent>
    </Card>
  );
}