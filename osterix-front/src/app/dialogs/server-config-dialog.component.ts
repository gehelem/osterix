import { Component, OnInit, Inject, ViewEncapsulation } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { ServerConfigService, ServerConfig } from '../services/server-config.service';
import { WebsocketService } from '../services/websocket.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-server-config-dialog',
  templateUrl: './server-config-dialog.component.html',
  styleUrls: ['./server-config-dialog.component.css'],
  encapsulation: ViewEncapsulation.None
})
export class ServerConfigDialogComponent implements OnInit {
  configForm: FormGroup;
  testing = false;
  testResult: { success: boolean; message: string } | null = null;

  constructor(
    private formBuilder: FormBuilder,
    private serverConfigService: ServerConfigService,
    private websocketService: WebsocketService,
    private snackBar: MatSnackBar,
    public dialogRef: MatDialogRef<ServerConfigDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.configForm = this.formBuilder.group({
      host: ['', [Validators.required, Validators.minLength(1)]],
      port: [9624, [Validators.required, Validators.min(1), Validators.max(65535)]],
      secure: [false]
    });
  }

  ngOnInit(): void {
    // Load current configuration
    const currentConfig = this.serverConfigService.getConfig();
    this.configForm.patchValue({
      host: currentConfig.host,
      port: currentConfig.port,
      secure: currentConfig.secure
    });
  }

  /**
   * Test connection to the configured server
   */
  async testConnection(): Promise<void> {
    if (this.configForm.invalid) {
      this.snackBar.open('Veuillez remplir tous les champs correctement', 'Fermer', { duration: 3000 });
      return;
    }

    this.testing = true;
    this.testResult = null;

    try {
      // Build a temporary config for testing
      const testConfig: ServerConfig = this.configForm.value;

      // Build URL the same way ServerConfigService does
      let url: string;
      if (testConfig.secure) {
        // SSL: https://host (port 443 implicit)
        url = `https://${testConfig.host}/`;
      } else {
        // Non-SSL: http://host (port 80 implicit)
        url = `http://${testConfig.host}/`;
      }

      const response = await fetch(url, {
        method: 'HEAD',
        mode: 'no-cors'
      });

      this.testResult = {
        success: true,
        message: `Connexion réussie au serveur (${url})`
      };

      this.snackBar.open('Connexion réussie!', 'Fermer', { duration: 3000 });
    } catch (error) {
      this.testResult = {
        success: false,
        message: `Connexion échouée. Vérifiez l'adresse et le port du serveur`
      };

      this.snackBar.open('Connexion échouée', 'Fermer', { duration: 3000 });
    } finally {
      this.testing = false;
    }
  }

  /**
   * Save configuration and close dialog
   */
  saveConfig(): void {
    if (this.configForm.invalid) {
      this.snackBar.open('Veuillez remplir tous les champs correctement', 'Fermer', { duration: 3000 });
      return;
    }

    const config: ServerConfig = this.configForm.value;
    this.serverConfigService.saveConfig(config);

    // If this is the initial configuration dialog, don't reconnect
    // (AppComponent will connect after dialog closes)
    // If this is called later, do reconnect
    if (!this.data?.isInitial) {
      this.websocketService.reconnect();
      this.snackBar.open('Configuration sauvegardée et reconnexion en cours...', 'Fermer', { duration: 2000 });
    } else {
      this.snackBar.open('Configuration sauvegardée', 'Fermer', { duration: 2000 });
    }

    this.dialogRef.close({ saved: true, config });
  }

  /**
   * Reset to default configuration
   */
  resetToDefaults(): void {
    this.serverConfigService.resetToDefaults();
    const defaultConfig = this.serverConfigService.getConfig();

    this.configForm.patchValue({
      host: defaultConfig.host,
      port: defaultConfig.port,
      secure: defaultConfig.secure
    });

    this.snackBar.open('Configuration réinitialisée aux valeurs par défaut', 'Fermer', { duration: 2000 });
  }

  /**
   * Cancel and close dialog
   */
  cancel(): void {
    this.dialogRef.close({ saved: false });
  }

  /**
   * Get the WebSocket URL that would be used with current config
   *
   * Non-SSL: ws://host:9624
   * SSL: wss://host/ws/
   */
  getPreviewUrl(): string {
    if (this.configForm.invalid) {
      return '';
    }

    const config = this.configForm.value as ServerConfig;
    if (config.secure) {
      // SSL: wss://host/ws/ with implicit port 443
      return `wss://${config.host}/ws/`;
    } else {
      // Non-SSL: ws://host:9624
      return `ws://${config.host}:${config.port}`;
    }
  }

  /**
   * Get the HTTP URL that would be used with current config
   *
   * Non-SSL: http://host (port 80 implicit)
   * SSL: https://host (port 443 implicit)
   */
  getHttpPreviewUrl(): string {
    if (this.configForm.invalid) {
      return '';
    }

    const config = this.configForm.value as ServerConfig;
    const protocol = config.secure ? 'https://' : 'http://';
    return `${protocol}${config.host}`;
  }
}
