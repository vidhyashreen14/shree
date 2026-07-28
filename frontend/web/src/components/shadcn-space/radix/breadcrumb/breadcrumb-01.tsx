<<<<<<< HEAD
import { HomeIcon } from "lucide-react";
=======
import { HomeIcon } from 'lucide-react';
>>>>>>> a821a0c (second update)
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
<<<<<<< HEAD
} from "@/components/ui/breadcrumb";
=======
} from '@/components/ui/breadcrumb';
>>>>>>> a821a0c (second update)

const BreadcrumbOutlineDemo = () => {
  return (
    <Breadcrumb>
      <BreadcrumbList className="h-8 gap-2 rounded-full border px-3 text-sm">
        <BreadcrumbItem>
          <BreadcrumbLink href="#">
            <HomeIcon className="size-4" />
            <span className="sr-only">Home</span>
          </BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator />
        <BreadcrumbItem>
          <BreadcrumbLink href="#">Profile</BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator />
        <BreadcrumbItem>
          <BreadcrumbPage>Settings</BreadcrumbPage>
        </BreadcrumbItem>
      </BreadcrumbList>
    </Breadcrumb>
  );
};

export default BreadcrumbOutlineDemo;
