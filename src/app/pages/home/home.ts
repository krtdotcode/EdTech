import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { Header } from "../../shared/components/header/header";
import { Footer } from "../../shared/components/footer/footer";
import { NgxParticlesModule } from "@tsparticles/angular";
import { loadSlim } from "@tsparticles/slim";

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [RouterModule, Header, Footer, NgxParticlesModule],
  templateUrl: './home.html',
  styleUrl: './home.scss'
})
export class Home {
  particlesInit = async (engine: any) => {
    await loadSlim(engine);
  };

  particlesOptions: any = {
    background: {
      color: {
        value: "transparent"
      }
    },
    fpsLimit: 60,
    particles: {
      color: {
        value: ["#ffffff", "#a855f7", "#8b5cf6", "#7c3aed"]
      },
      links: {
        color: "#ffffff",
        distance: 120,
        enable: true,
        opacity: 0.2,
        width: 1
      },
      move: {
        enable: true,
        outModes: {
          default: "bounce"
        },
        speed: 1
      },
      number: {
        density: {
          enable: true,
          area: 500
        },
        value: 120
      },
      opacity: {
        value: 0.4
      },
      shape: {
        type: "circle"
      },
      size: {
        value: { min: 2, max: 6 }
      }
    },
    detectRetina: true
  };
}
