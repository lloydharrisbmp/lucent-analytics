import React from "react";

export interface FooterLink {
  label: string;
  href: string;
}

export interface FooterColumn {
  title: string;
  links: FooterLink[];
}

export interface Props {
  logo?: React.ReactNode;
  columns: FooterColumn[];
  copyright: string;
}

export const FooterSection = ({ logo, columns, copyright }: Props) => {
  return (
    <footer className="py-12 bg-background">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8">
          {logo && (
            <div className="col-span-2 md:col-span-1">
              {logo}
              <p className="mt-4 text-sm text-muted-foreground">
                Transform financial data into actionable insights with our cloud-native platform.
              </p>
            </div>
          )}
          
          {columns.map((column, index) => (
            <div key={index}>
              <h3 className="font-semibold mb-3">{column.title}</h3>
              <ul className="space-y-2">
                {column.links.map((link, i) => (
                  <li key={i}>
                    <a
                      href={link.href}
                      className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        
        <div className="mt-12 pt-8 border-t border-border">
          <p className="text-sm text-muted-foreground text-center">
            {copyright}
          </p>
        </div>
      </div>
    </footer>
  );
};
